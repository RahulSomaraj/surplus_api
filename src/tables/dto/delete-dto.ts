import { IsInt, IsOptional } from "class-validator";

export class DeleteTableDto {
    @IsOptional()
    @IsInt()
    deletedBy:number;
}