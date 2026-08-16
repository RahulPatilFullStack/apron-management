import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Stand } from '../models/stand.model';

@Injectable({ providedIn: 'root' })
export class StandsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/stands`;

  readonly stands = signal<Stand[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const results = await firstValueFrom(this.http.get<Stand[]>(this.baseUrl));
      this.stands.set(results);
    } catch {
      this.error.set('Failed to load stands. Is the backend running?');
    } finally {
      this.loading.set(false);
    }
  }
}
