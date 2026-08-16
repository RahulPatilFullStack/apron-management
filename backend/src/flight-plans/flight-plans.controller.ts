import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FlightPlansService } from './flight-plans.service';
import { CreateFlightPlanDto } from './dto/create-flight-plan.dto';
import { UpdateFlightPlanDto } from './dto/update-flight-plan.dto';
import { QueryFlightPlanDto } from './dto/query-flight-plan.dto';

@Controller('flight-plans')
export class FlightPlansController {
  constructor(private readonly flightPlansService: FlightPlansService) {}

  @Get()
  findAll(@Query() query: QueryFlightPlanDto) {
    return this.flightPlansService.findAll(query);
  }

  @Get(':id/linked')
  findLinked(@Param('id', ParseIntPipe) id: number) {
    return this.flightPlansService.findLinked(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.flightPlansService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFlightPlanDto) {
    return this.flightPlansService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFlightPlanDto) {
    return this.flightPlansService.update(id, dto);
  }
}
