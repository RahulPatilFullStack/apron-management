import { DatePipe } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FlightPlansService } from '../../../core/services/flight-plans.service';
import { StandAssignmentsService } from '../../../core/services/stand-assignments.service';
import { flightPlanTypeBadgeClass } from '../../../core/utils/flight-plan-type';

@Component({
  selector: 'app-flight-plan-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './flight-plan-detail.html',
})
export class FlightPlanDetail {
  readonly id = input.required<string>();

  protected readonly flightPlansService = inject(FlightPlansService);
  protected readonly standAssignmentsService = inject(StandAssignmentsService);
  protected readonly typeBadgeClass = flightPlanTypeBadgeClass;

  constructor() {
    effect(() => {
      const flightPlanId = Number(this.id());
      if (!Number.isFinite(flightPlanId)) return;
      void this.flightPlansService.selectFlightPlan(flightPlanId);
      void this.standAssignmentsService.load();
    });
  }

  protected assignmentsFor(flightPlanId: number) {
    return this.standAssignmentsService
      .assignments()
      .filter((assignment) => assignment.flightPlanId === flightPlanId);
  }
}
