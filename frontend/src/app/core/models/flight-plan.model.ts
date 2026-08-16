export interface FlightPlan {
  id: number;
  ifplid: string | null;
  flightId: string;
  flightPlanType: string;
  flightPlanAction: string | null;
  created: string | null;
  updated: string | null;
  linkedFlightId: string | null;
  linkedFlightPlanType: string | null;
  originDate: string | null;
  carrier: string | null;
  flightNumber: string | null;
  calculatedCallsign: string | null;
  aircraftRegistration: string | null;
  aircraftType: string | null;
  aircraftTypeIcao: string | null;
  adep: string | null;
  ades: string | null;
  stand: string | null;
  apron: string | null;
  terminal: string | null;
  aibt: string | null;
  sta: string | null;
  aobt: string | null;
  std: string | null;
}

export interface FlightPlanQuery {
  search?: string;
  flightPlanType?: string;
  originDateFrom?: string;
  originDateTo?: string;
}
