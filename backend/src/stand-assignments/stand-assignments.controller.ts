import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { StandAssignmentsService } from './stand-assignments.service';
import { CreateStandAssignmentDto } from './dto/create-stand-assignment.dto';
import { QueryStandAssignmentDto } from './dto/query-stand-assignment.dto';

@Controller('stand-assignments')
export class StandAssignmentsController {
  constructor(private readonly standAssignmentsService: StandAssignmentsService) {}

  @Get()
  findAll(@Query() query: QueryStandAssignmentDto) {
    return this.standAssignmentsService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateStandAssignmentDto) {
    return this.standAssignmentsService.create(dto);
  }
}
