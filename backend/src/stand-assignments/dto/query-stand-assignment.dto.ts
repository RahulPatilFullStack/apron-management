import { IsDateString, IsOptional, IsString } from 'class-validator';

export class QueryStandAssignmentDto {
  @IsOptional()
  @IsString()
  standId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
