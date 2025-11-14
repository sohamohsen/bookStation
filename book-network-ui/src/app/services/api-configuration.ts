import { Injectable } from '@angular/core';

export interface ApiConfigurationParams {
  rootUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiConfiguration {
  rootUrl: string = 'http://localhost:8030/api/v1';
}
