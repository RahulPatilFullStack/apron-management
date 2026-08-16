import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateStandAssignment, StandAssignment } from '../models/stand-assignment.model';

@Injectable({ providedIn: 'root' })
export class StandAssignmentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/stand-assignments`;

  readonly assignments = signal<StandAssignment[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly createError = signal<string | null>(null);
  readonly creating = signal(false);

  async load(filters: { standId?: string; from?: string; to?: string } = {}): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams();
      if (filters.standId) params = params.set('standId', filters.standId);
      if (filters.from) params = params.set('from', filters.from);
      if (filters.to) params = params.set('to', filters.to);

      const results = await firstValueFrom(
        this.http.get<StandAssignment[]>(this.baseUrl, { params }),
      );
      this.assignments.set(results);
    } catch {
      this.error.set('Failed to load stand assignments. Is the backend running?');
    } finally {
      this.loading.set(false);
    }
  }

  async create(dto: CreateStandAssignment): Promise<boolean> {
    this.creating.set(true);
    this.createError.set(null);
    try {
      const created = await firstValueFrom(
        this.http.post<StandAssignment>(this.baseUrl, dto),
      );
      this.assignments.update((current) => [...current, created]);
      return true;
    } catch (err) {
      const message =
        err instanceof HttpErrorResponse && typeof err.error?.message === 'string'
          ? err.error.message
          : 'Failed to create stand assignment.';
      this.createError.set(message);
      return false;
    } finally {
      this.creating.set(false);
    }
  }
}
