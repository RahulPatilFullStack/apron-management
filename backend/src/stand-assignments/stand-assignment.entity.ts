import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FlightPlan } from '../flight-plans/flight-plan.entity';
import { Stand } from '../stands/stand.entity';

@Entity('stand_assignments')
@Index(['standId', 'fromTime', 'toTime'])
export class StandAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  flightPlanId: number;

  @ManyToOne(() => FlightPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flightPlanId' })
  flightPlan: FlightPlan;

  @Column({ type: 'varchar' })
  standId: string;

  @ManyToOne(() => Stand, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'standId' })
  stand: Stand;

  @Column({ type: 'timestamptz' })
  fromTime: Date;

  @Column({ type: 'timestamptz' })
  toTime: Date;

  @Column({ type: 'varchar', nullable: true })
  remarks: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
