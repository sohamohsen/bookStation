import { mergeApplicationConfig, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideServerRendering } from '@angular/ssr';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideServerRendering()
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);

// Add this function for prerendering parameterized routes
export function getPrerenderParams() {
  return {
    routes: [
      // List all static routes
      '/',
      '/login',
      '/register',
      '/books',
      '/dashboard',
      // Add parameterized routes with specific values
      '/books/manage/1',
      '/books/manage/2',
      '/books/manage/3',
      // Add more IDs as needed or fetch from API
    ]
  };
}
