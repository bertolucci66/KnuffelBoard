import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter([
          { path: '', loadComponent: () => import('./app/home/home.component').then(m => m.HomeComponent) },
          { path: 'history', loadComponent: () => import('./app/history-view/history-view.component').then(m => m.HistoryViewComponent) }
        ]),
    provideHttpClient(withFetch())
  ]
}).catch(err => console.error(err));
