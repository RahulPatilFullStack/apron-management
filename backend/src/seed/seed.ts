import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from '../config/typeorm.config';
import { Stand } from '../stands/stand.entity';
import { FlightPlan } from '../flight-plans/flight-plan.entity';

const DATA_DIR = join(__dirname, '..', '..', '..', 'data');

function readJson<T>(fileName: string): T {
  const raw = readFileSync(join(DATA_DIR, fileName), 'utf-8');
  return JSON.parse(raw) as T;
}

async function chunkedSave<T>(
  dataSource: DataSource,
  entity: new () => T,
  rows: Partial<T>[],
  chunkSize: number,
): Promise<void> {
  const repository = dataSource.getRepository(entity);
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await repository.save(chunk as T[]);
    console.log(
      `  ${entity.name}: seeded ${Math.min(i + chunkSize, rows.length)}/${rows.length}`,
    );
  }
}

async function run() {
  const dataSource = new DataSource(buildDataSourceOptions());
  await dataSource.initialize();
  console.log('Connected to database, starting seed...');

  const rawStands = readJson<Partial<Stand>[]>('stands.json');
  // stands.json contains duplicate `stand` codes (same PK); keep the last
  // occurrence of each, matching typical "latest wins" feed semantics.
  const stands = [...new Map(rawStands.map((s) => [s.stand, s])).values()];
  console.log(
    `Seeding ${stands.length} stands (${rawStands.length - stands.length} duplicate stand codes deduped)...`,
  );
  await chunkedSave(dataSource, Stand, stands, 200);

  const flightPlans = readJson<Partial<FlightPlan>[]>('flightplans.json');
  console.log(`Seeding ${flightPlans.length} flight plans...`);
  await chunkedSave(dataSource, FlightPlan, flightPlans, 500);

  const standCount = await dataSource.getRepository(Stand).count();
  const flightPlanCount = await dataSource.getRepository(FlightPlan).count();
  console.log(
    `Done. stands=${standCount} flight_plans=${flightPlanCount}`,
  );

  await dataSource.destroy();
}

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
