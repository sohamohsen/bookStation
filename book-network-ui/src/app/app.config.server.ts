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
