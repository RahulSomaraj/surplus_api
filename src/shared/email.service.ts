import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private sesClient = new SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  async sendOtp(email: string, otp: string): Promise<void> {
    const input = {
      Source: process.env.SES_FROM_EMAIL || process.env.EMAIL_USER,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Your OTP Code',
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const command = new SendEmailCommand(input);

    try {
      const response = await this.sesClient.send(command);
      console.log(`OTP sent to ${email}, MessageId: ${response.MessageId}`);
    } catch (error) {
      console.error(`Error sending OTP to ${email}:`, error);
      throw new Error('Unable to send OTP');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${resetToken}`;

    const text = `You requested a password reset. Use the link below to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <p>
          <a href="${resetUrl}" style="background-color: #2563eb; color: #fff; padding: 10px 16px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 1 hour. If you didn't request this, you can ignore this email.</p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset your password',
      text,
      html,
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const input = {
      Source: process.env.SES_FROM_EMAIL || process.env.EMAIL_USER,
      Destination: {
        ToAddresses: [options.to],
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8',
        },
        Body: {
          ...(options.text && {
            Text: {
              Data: options.text,
              Charset: 'UTF-8',
            },
          }),
          ...(options.html && {
            Html: {
              Data: options.html,
              Charset: 'UTF-8',
            },
          }),
        },
      },
    };

    const command = new SendEmailCommand(input);

    try {
      const response = await this.sesClient.send(command);
      console.log(
        `Email sent to ${options.to}, MessageId: ${response.MessageId}`,
      );
    } catch (error) {
      console.error(`Error sending email to ${options.to}:`, error);
      throw new Error('Unable to send email');
    }
  }
}
