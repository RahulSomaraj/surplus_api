import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, isNotEmpty, IsString } from "class-validator";

export class CreateOrderDto {
    
    @IsArray()
    @ArrayNotEmpty({ message: 'items should not be empty' })
    @IsString({ each: true, message: 'each item must be a string' })
    items:string[];

    @Type(() => Number)
    @IsInt({ message: 'totalPrice must be an integer' })
    @IsNotEmpty({ message: 'totalPrice is required' })
    totalPrice:number;

    @Type(() => Number)
    @IsInt({ message: 'userId must be a number' })
    @IsNotEmpty({ message: 'userId is required' })
    userId:number;

    @Type(() => Number)
    @IsInt({ message: 'restaurantId must be a number' })
    @IsNotEmpty({ message: 'restaurantId is required' })
    restaurantId:number;

    @IsString()
    @IsNotEmpty({ message: 'status is required' })
    status:string;

    @Type(() => Number)
    @IsInt({ message: 'createdBy must be a number' })
    createdBy?: number;
}
