import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FlightPlansService } from '../../../core/services/flight-plans.service';
import { FlightPlanCard } from '../flight-plan-card/flight-plan-card';
import { FlightPlan } from '../../../core/models/flight-plan.model';

const FLIGHT_PLAN_TYPES = [
  'Arrival',
  'Departure',
  'TowInMovement',
  'TowOutMovement',
];

@Component({
  selector: 'app-flight-plan-list',
  imports: [FormsModule, FlightPlanCard],
  templateUrl: './flight-plan-list.html',
})
export class FlightPlanList implements OnInit {
  protected readonly flightPlansService = inject(FlightPlansService);
  private readonly router = inject(Router);

  protected readonly flightPlanTypes = FLIGHT_PLAN_TYPES;
  protected readonly skeletonRows = Array.from({ length: 8 }, (_, i) => i);

  ngOnInit(): void {
    void this.flightPlansService.search();
  }

  protected onSearchChange(value: string): void {
    this.flightPlansService.searchTerm.set(value);
    void this.flightPlansService.search();
  }

  protected onTypeChange(value: string): void {
    this.flightPlansService.flightPlanTypeFilter.set(value || null);
    void this.flightPlansService.search();
  }

  protected onSelect(flightPlan: FlightPlan): void {
    void this.router.navigate(['/flight-plans', flightPlan.id]);
  }
}
