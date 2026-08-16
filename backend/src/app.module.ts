import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './config/typeorm.config';
import { FlightPlansModule } from './flight-plans/flight-plans.module';
import { StandsModule } from './stands/stands.module';
import { StandAssignmentsModule } from './stand-assignments/stand-assignments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(buildDataSourceOptions()),
    FlightPlansModule,
    StandsModule,
    StandAssignmentsModule,
  ],
})
export class AppModule {}
