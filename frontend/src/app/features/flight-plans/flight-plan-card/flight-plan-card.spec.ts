import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FlightPlanCard } from './flight-plan-card';
import { FlightPlan } from '../../../core/models/flight-plan.model';

const sampleFlightPlan: FlightPlan = {
  id: 97238,
  ifplid: '299428080897_1-TOU',
  flightId: '8afc5c99-0011-5093-bbdb-05adc94f1b74',
  flightPlanType: 'TowOutMovement',
  flightPlanAction: 'Active',
  created: '2026-03-05T15:23:37.898Z',
  updated: '2026-03-06T07:09:02.484Z',
  linkedFlightId: '299428080897',
  linkedFlightPlanType: 'Arrival',
  originDate: '2026-03-06',
  carrier: 'AF',
  flightNumber: '063',
  calculatedCallsign: 'AF 063',
  aircraftRegistration: 'FHUVQ',
  aircraftType: 'A350/9',
  aircraftTypeIcao: 'A359',
  adep: 'KEWR',
  ades: 'LFPG',
  stand: 'K21',
  apron: 'Aire_T2E_S3',
  terminal: 'Terminal_2',
  aibt: null,
  sta: null,
  aobt: '2026-03-06T06:45:00.000Z',
  std: '2026-03-06T06:40:00.000Z',
};

describe('FlightPlanCard', () => {
  let fixture: ComponentFixture<FlightPlanCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightPlanCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FlightPlanCard);
    fixture.componentRef.setInput('flightPlan', sampleFlightPlan);
    fixture.detectChanges();
  });

  it('renders the callsign, type, and route', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('AF 063');
    expect(text).toContain('TowOutMovement');
    expect(text).toContain('KEWR');
    expect(text).toContain('LFPG');
  });

  it('falls back to carrier + flightNumber when calculatedCallsign is missing', () => {
    fixture.componentRef.setInput('flightPlan', {
      ...sampleFlightPlan,
      calculatedCallsign: null,
    });
    fixture.detectChanges();
    expect((fixture.nativeElement.textContent as string)).toContain('AF063');
  });

  it('emits select with the flight plan on click', () => {
    const emitted: FlightPlan[] = [];
    fixture.componentInstance.select.subscribe((fp) => emitted.push(fp));

    fixture.debugElement.query(By.css('article')).triggerEventHandler('click');

    expect(emitted).toEqual([sampleFlightPlan]);
  });
});
