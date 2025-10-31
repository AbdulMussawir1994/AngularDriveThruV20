import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { Outlet } from 'interface/Outlet';

@Injectable({
  providedIn: 'root'
})
export class OutletService {
  private readonly apiUrl = `${environment.BaseApiUrl}/outlets`; // ✅ e.g. https://api.example.com/outlet

  constructor(private http: HttpClient) {}

  /** 🔹 Get all outlets */
  list(): Observable<Outlet[]> {
    return this.http.get<Outlet[]>(this.apiUrl).pipe(
      catchError(err => {
        console.error('❌ Error loading outlets:', err);
        return of([]); // return empty array on error
      })
    );
  }

  /** 🔹 Get single outlet by ID */
  get(id: number): Observable<Outlet> {
    return this.http.get<Outlet>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`❌ Error fetching outlet ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  /** 🔹 Create a new outlet */
  create(outlet: Outlet): Observable<Outlet> {
    return this.http.post<Outlet>(this.apiUrl, outlet).pipe(
      catchError(err => {
        console.error('❌ Error creating outlet:', err);
        return throwError(() => err);
      })
    );
  }

  /** 🔹 Update an existing outlet */
  update(id: number, outlet: Outlet): Observable<Outlet> {
    return this.http.put<Outlet>(`${this.apiUrl}/${id}`, outlet).pipe(
      catchError(err => {
        console.error(`❌ Error updating outlet ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  /** 🔹 Delete outlet by ID */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`❌ Error deleting outlet ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
