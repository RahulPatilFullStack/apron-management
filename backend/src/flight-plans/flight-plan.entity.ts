import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

/**
 * Mirrors the shape of `flightplans.json`. Every key present in the source
 * JSON has a corresponding column. `stand`/`apron`/`terminal` are kept as
 * plain denormalized text fields (as supplied by the source system) rather
 * than a foreign key to `Stand` — see README "Data model" for rationale.
 */
@Entity('flight_plans')
export class FlightPlan {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', nullable: true })
  ifplid: string | null;

  @Index()
  @Column({ type: 'varchar' })
  flightId: string;

  @Index()
  @Column({ type: 'varchar' })
  flightPlanType: string;

  @Column({ type: 'varchar', nullable: true })
  flightPlanAction: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  created: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  updated: Date | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  linkedFlightId: string | null;

  @Column({ type: 'varchar', nullable: true })
  linkedFlightPlanType: string | null;

  @Index()
  @Column({ type: 'date', nullable: true })
  originDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  carrier: string | null;

  @Column({ type: 'varchar', nullable: true })
  flightNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  calculatedCallsign: string | null;

  @Column({ type: 'varchar', nullable: true })
  aircraftRegistration: string | null;

  @Column({ type: 'varchar', nullable: true })
  aircraftType: string | null;

  @Column({ type: 'varchar', nullable: true })
  aircraftTypeIcao: string | null;

  @Column({ type: 'varchar', nullable: true })
  adep: string | null;

  @Column({ type: 'varchar', nullable: true })
  ades: string | null;

  @Column({ type: 'varchar', nullable: true })
  stand: string | null;

  @Column({ type: 'varchar', nullable: true })
  apron: string | null;

  @Column({ type: 'varchar', nullable: true })
  terminal: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  aibt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  sta: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  aobt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  std: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  recordCreatedAt: Date;
}
