import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { activateCode } from '../fn/authentication/activate-code';
import { ActivateCode$Params } from '../fn/authentication/activate-code';
import { authenticate } from '../fn/authentication/authenticate';
import { Authenticate$Params } from '../fn/authentication/authenticate';
import { AuthenticationResponse } from '../models/authentication-response';
import { register } from '../fn/authentication/register';
import { Register$Params } from '../fn/authentication/register';

/**
 * Endpoints for user authentication and registration
 */
@Injectable({ providedIn: 'root' })
export class AuthenticationService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `register()` */
  static readonly RegisterPath = '/auth/register';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `register()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  register$Response(params: Register$Params, context?: HttpContext): Observable<StrictHttpResponse<{}>> {
    return register(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `register$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  register(params: Register$Params, context?: HttpContext): Observable<{}> {
    return this.register$Response(params, context).pipe(
      map((r: StrictHttpResponse<{}>): {} => r.body),
      catchError(error => this.handleApiError(error))
    );
  }

  /** Path part for operation `authenticate()` */
  static readonly AuthenticatePath = '/auth/authentication';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `authenticate()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  authenticate$Response(params: Authenticate$Params, context?: HttpContext): Observable<StrictHttpResponse<AuthenticationResponse>> {
    return authenticate(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `authenticate$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  authenticate(params: Authenticate$Params, context?: HttpContext): Observable<AuthenticationResponse> {
    return this.authenticate$Response(params, context).pipe(
      map((r: StrictHttpResponse<AuthenticationResponse>): AuthenticationResponse => r.body),
      catchError(error => this.handleApiError(error))
    );
  }

  /** Path part for operation `activateCode()` */
  static readonly ActivateCodePath = '/auth/activate-code';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `activateCode()` instead.
   *
   * This method doesn't expect any request body.
   */
  activateCode$Response(params: ActivateCode$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return activateCode(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `activateCode$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  activateCode(params: ActivateCode$Params, context?: HttpContext): Observable<void> {
    return this.activateCode$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body),
      catchError(error => this.handleApiError(error))
    );
  }

  /**
   * Handle API errors including Blob responses
   */
  private handleApiError(error: any): Observable<never> {
    // If it's already an HttpErrorResponse with parsed error, just rethrow
    if (error instanceof HttpErrorResponse && !(error.error instanceof Blob)) {
      return throwError(() => error);
    }

    // Handle Blob error responses
    if (error?.error instanceof Blob) {
      return new Observable(observer => {
        const reader = new FileReader();

        reader.onload = () => {
          try {
            const errorText = reader.result as string;
            let parsedError: any;

            // Try to parse as JSON, fallback to plain text
            try {
              parsedError = JSON.parse(errorText);
            } catch {
              parsedError = errorText || 'Unknown error occurred';
            }

            // Create proper HttpErrorResponse
            const httpError = new HttpErrorResponse({
              error: parsedError,
              headers: error.headers,
              status: error.status,
              statusText: error.statusText,
              url: error.url || undefined
            });

            observer.error(httpError);
          } catch (e) {
            // If parsing fails, return original error
            console.error('Error parsing Blob response:', e);
            observer.error(error);
          }
        };

        reader.onerror = () => {
          console.error('Error reading Blob:', reader.error);
          observer.error(error);
        };

        reader.readAsText(error.error);
      });
    }

    // For non-Blob errors, just rethrow
    return throwError(() => error);
  }

  activate(param: { code: string }) {

  }
}
