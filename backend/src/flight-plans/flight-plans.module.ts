import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightPlan } from './flight-plan.entity';
import { FlightPlansService } from './flight-plans.service';
import { FlightPlansController } from './flight-plans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlightPlan])],
  controllers: [FlightPlansController],
  providers: [FlightPlansService],
  exports: [TypeOrmModule, FlightPlansService],
})
export class FlightPlansModule {}
