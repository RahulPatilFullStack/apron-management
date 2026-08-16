import { FlightPlan } from './flight-plan.model';
import { Stand } from './stand.model';

export interface StandAssignment {
  id: number;
  flightPlanId: number;
  flightPlan?: FlightPlan;
  standId: string;
  stand?: Stand;
  fromTime: string;
  toTime: string;
  remarks: string | null;
  createdAt: string;
}

export interface CreateStandAssignment {
  flightPlanId: number;
  standId: string;
  fromTime: string;
  toTime: string;
  remarks?: string;
}
