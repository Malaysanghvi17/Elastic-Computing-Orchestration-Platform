import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PodShellComponent } from './components/pod-shell/pod-shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DashboardComponent, PodShellComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'kubernetes-dashboard';
}
