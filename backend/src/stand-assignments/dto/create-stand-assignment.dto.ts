import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateStandAssignmentDto {
  @IsInt()
  flightPlanId: number;

  @IsString()
  standId: string;

  @IsDateString()
  fromTime: string;

  @IsDateString()
  toTime: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
