import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Ion } from 'cesium';
import { AppModule } from './app/app.module';

(window as Record<string, any>)['CESIUM_BASE_URL'] = '/assets/cesium/';

Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTA4NzgwNS03OTc2LTRhNjQtYTI2Yi0yMjJmMTg2YWNlZWEiLCJpZCI6MTQ2MjY2LCJpYXQiOjE2ODY3NDQ1MjJ9.WbSNnZK9_ogI_06JySyLFqjs7rb6wPojU_h6R1y_L4s';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
