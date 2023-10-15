import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LabInput, LabOutput } from '@core/state/labs/labs.model';
import { Lab } from '@lab/lab';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { ServerSelectors } from '@core/state/server/server.selectors';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly store = inject(Store);
  private readonly http = inject(HttpClient);

  calculateLab(lab: Lab, labInput: LabInput): Observable<LabOutput> {
    const apiUrl = this.store.selectSnapshot(ServerSelectors.getApiUrl);
    if (!apiUrl) throw new Error('API URL not set');

    // Remove null values from labInput
    for (const key in labInput) {
      if (labInput[key] === null) {
        delete labInput[key];
      }
    }

    const queryParams = new HttpParams({
      fromObject: labInput,
    });
    return this.http.get<LabOutput>(`${apiUrl}/${lab.apiUrl}`, { params: queryParams });
  }

  validateExpression(expression: string): Observable<boolean> {
    const apiUrl = this.store.selectSnapshot(ServerSelectors.getApiUrl);
    if (!apiUrl) throw new Error('API URL not set');

    return this.http.get<boolean>(`${apiUrl}/validate_expression`, { params: { expression } });
  }
}
