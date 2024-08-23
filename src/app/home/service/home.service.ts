import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  public errorAPI = environment.localdomain + 'process-image';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error(`Backend returned code ${error.status}, body was: `, error.error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
  

  detectErrorInFiles(data: FormData) {
    const headers = new HttpHeaders({
      // 'Content-Type': 'multipart/form-data' should be omitted; the browser will set this automatically.
    });
  
    return this.http.post<any>(this.errorAPI, data, {
      headers: headers,
      reportProgress: true, // Optional: to track progress
      observe: 'events'     // Optional: to observe upload progress
    }).pipe(
      catchError(this.handleError)
    );
  }
  
  
}
