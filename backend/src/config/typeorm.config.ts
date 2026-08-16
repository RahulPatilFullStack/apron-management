import { DataSourceOptions } from 'typeorm';
import { FlightPlan } from '../flight-plans/flight-plan.entity';
import { Stand } from '../stands/stand.entity';
import { StandAssignment } from '../stand-assignments/stand-assignment.entity';

export function buildDataSourceOptions(
  env: NodeJS.ProcessEnv = process.env,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST ?? 'localhost',
    port: Number(env.DB_PORT ?? 5432),
    username: env.DB_USERNAME ?? 'apron',
    password: env.DB_PASSWORD ?? 'apron',
    database: env.DB_DATABASE ?? 'apron_management',
    entities: [FlightPlan, Stand, StandAssignment],
    // Fine for a take-home project seeded from scratch; a real project would use migrations.
    synchronize: true,
  };
}
