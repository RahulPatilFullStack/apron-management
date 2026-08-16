import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandAssignment } from './stand-assignment.entity';
import { StandAssignmentsService } from './stand-assignments.service';
import { StandAssignmentsController } from './stand-assignments.controller';
import { FlightPlansModule } from '../flight-plans/flight-plans.module';
import { StandsModule } from '../stands/stands.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StandAssignment]),
    FlightPlansModule,
    StandsModule,
  ],
  controllers: [StandAssignmentsController],
  providers: [StandAssignmentsService],
})
export class StandAssignmentsModule {}
