import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { FlightPlan } from '../../../core/models/flight-plan.model';
import { flightPlanTypeBadgeClass } from '../../../core/utils/flight-plan-type';

@Component({
  selector: 'app-flight-plan-card',
  imports: [DatePipe],
  templateUrl: './flight-plan-card.html',
})
export class FlightPlanCard {
  readonly flightPlan = input.required<FlightPlan>();
  readonly select = output<FlightPlan>();

  protected readonly displayCallsign = computed(() => {
    const fp = this.flightPlan();
    return fp.calculatedCallsign || `${fp.carrier ?? ''}${fp.flightNumber ?? ''}`;
  });

  protected readonly relevantTime = computed(() => {
    const fp = this.flightPlan();
    return fp.sta ?? fp.std ?? fp.aibt ?? fp.aobt ?? null;
  });

  protected readonly relevantTimeLabel = computed(() => {
    const fp = this.flightPlan();
    if (fp.sta) return 'STA';
    if (fp.std) return 'STD';
    if (fp.aibt) return 'AIBT';
    if (fp.aobt) return 'AOBT';
    return null;
  });

  protected readonly typeClass = computed(() =>
    flightPlanTypeBadgeClass(this.flightPlan().flightPlanType),
  );

  protected onClick(): void {
    this.select.emit(this.flightPlan());
  }
}
