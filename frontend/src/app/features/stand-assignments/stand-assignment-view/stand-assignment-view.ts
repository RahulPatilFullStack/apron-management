import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StandsService } from '../../../core/services/stands.service';
import { StandAssignmentsService } from '../../../core/services/stand-assignments.service';
import { FlightPlansService } from '../../../core/services/flight-plans.service';

@Component({
  selector: 'app-stand-assignment-view',
  imports: [FormsModule, DatePipe],
  templateUrl: './stand-assignment-view.html',
})
export class StandAssignmentView implements OnInit {
  protected readonly standsService = inject(StandsService);
  protected readonly standAssignmentsService = inject(StandAssignmentsService);
  protected readonly flightPlansService = inject(FlightPlansService);

  protected readonly selectedStandId = signal<string | null>(null);
  protected readonly windowFrom = signal('');
  protected readonly windowTo = signal('');

  protected readonly formFlightPlanId = signal<number | null>(null);
  protected readonly formStandId = signal('');
  protected readonly formFromTime = signal('');
  protected readonly formToTime = signal('');
  protected readonly formRemarks = signal('');
  protected readonly createSuccess = signal(false);

  ngOnInit(): void {
    void this.standsService.load();
    void this.standAssignmentsService.load();
    void this.flightPlansService.search();
  }

  protected onStandFilterChange(standId: string): void {
    this.selectedStandId.set(standId || null);
    this.reloadAssignments();
  }

  protected onWindowChange(): void {
    this.reloadAssignments();
  }

  protected clearFilters(): void {
    this.selectedStandId.set(null);
    this.windowFrom.set('');
    this.windowTo.set('');
    this.reloadAssignments();
  }

  private reloadAssignments(): void {
    void this.standAssignmentsService.load({
      standId: this.selectedStandId() ?? undefined,
      from: this.windowFrom() ? new Date(this.windowFrom()).toISOString() : undefined,
      to: this.windowTo() ? new Date(this.windowTo()).toISOString() : undefined,
    });
  }

  protected async onSubmit(): Promise<void> {
    this.createSuccess.set(false);
    const flightPlanId = this.formFlightPlanId();
    if (!flightPlanId || !this.formStandId() || !this.formFromTime() || !this.formToTime()) {
      this.standAssignmentsService.createError.set('All fields except remarks are required.');
      return;
    }

    const ok = await this.standAssignmentsService.create({
      flightPlanId,
      standId: this.formStandId(),
      fromTime: new Date(this.formFromTime()).toISOString(),
      toTime: new Date(this.formToTime()).toISOString(),
      remarks: this.formRemarks() || undefined,
    });

    if (ok) {
      this.createSuccess.set(true);
      this.formRemarks.set('');
    }
  }
}
