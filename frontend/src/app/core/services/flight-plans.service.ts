import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FlightPlan } from '../models/flight-plan.model';

@Injectable({ providedIn: 'root' })
export class FlightPlansService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/flight-plans`;

  readonly searchTerm = signal('');
  readonly flightPlanTypeFilter = signal<string | null>(null);
  readonly flightPlans = signal<FlightPlan[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly selectedFlightPlan = signal<FlightPlan | null>(null);
  readonly linkedFlightPlans = signal<FlightPlan[]>([]);
  readonly linkedLoading = signal(false);

  async search(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams();
      if (this.searchTerm().trim()) {
        params = params.set('search', this.searchTerm().trim());
      }
      if (this.flightPlanTypeFilter()) {
        params = params.set('flightPlanType', this.flightPlanTypeFilter()!);
      }
      const results = await firstValueFrom(
        this.http.get<FlightPlan[]>(this.baseUrl, { params }),
      );
      this.flightPlans.set(results);
    } catch {
      this.error.set('Failed to load flight plans. Is the backend running?');
    } finally {
      this.loading.set(false);
    }
  }

  async selectFlightPlan(id: number): Promise<void> {
    this.linkedLoading.set(true);
    try {
      const [flightPlan, linked] = await Promise.all([
        firstValueFrom(this.http.get<FlightPlan>(`${this.baseUrl}/${id}`)),
        firstValueFrom(this.http.get<FlightPlan[]>(`${this.baseUrl}/${id}/linked`)),
      ]);
      this.selectedFlightPlan.set(flightPlan);
      this.linkedFlightPlans.set(linked);
    } finally {
      this.linkedLoading.set(false);
    }
  }

  clearSelection(): void {
    this.selectedFlightPlan.set(null);
    this.linkedFlightPlans.set([]);
  }
}
