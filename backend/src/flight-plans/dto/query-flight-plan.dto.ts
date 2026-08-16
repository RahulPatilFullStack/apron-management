import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryFlightPlanDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  flightPlanType?: string;

  @IsOptional()
  @IsDateString()
  originDateFrom?: string;

  @IsOptional()
  @IsDateString()
  originDateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 100;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
