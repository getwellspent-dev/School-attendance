import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="app-root">
      <app-navbar></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-root {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-page);
    }
    .main-content {
      flex: 1;
    }
  `]
})
export class AppComponent {
  title = 'TeachTrack - School Attendance';
}
