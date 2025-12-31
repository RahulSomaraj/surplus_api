import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty} from 'class-validator';

export class DeleteMenuDto {
  @IsNotEmpty({ message: 'deletedBy is required' })
  @Type(() => Number)
  @IsInt({ message: 'deletedBy must be a number' })
  deletedByUserId: number;
}
