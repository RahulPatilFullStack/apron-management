import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFlightPlanDto {
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  ifplid?: string;

  @IsString()
  flightId: string;

  @IsString()
  flightPlanType: string;

  @IsOptional()
  @IsString()
  flightPlanAction?: string;

  @IsOptional()
  @IsDateString()
  created?: string;

  @IsOptional()
  @IsDateString()
  updated?: string;

  @IsOptional()
  @IsString()
  linkedFlightId?: string;

  @IsOptional()
  @IsString()
  linkedFlightPlanType?: string;

  @IsOptional()
  @IsDateString()
  originDate?: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsString()
  flightNumber?: string;

  @IsOptional()
  @IsString()
  calculatedCallsign?: string;

  @IsOptional()
  @IsString()
  aircraftRegistration?: string;

  @IsOptional()
  @IsString()
  aircraftType?: string;

  @IsOptional()
  @IsString()
  aircraftTypeIcao?: string;

  @IsOptional()
  @IsString()
  adep?: string;

  @IsOptional()
  @IsString()
  ades?: string;

  @IsOptional()
  @IsString()
  stand?: string;

  @IsOptional()
  @IsString()
  apron?: string;

  @IsOptional()
  @IsString()
  terminal?: string;

  @IsOptional()
  @IsDateString()
  aibt?: string;

  @IsOptional()
  @IsDateString()
  sta?: string;

  @IsOptional()
  @IsDateString()
  aobt?: string;

  @IsOptional()
  @IsDateString()
  std?: string;
}
