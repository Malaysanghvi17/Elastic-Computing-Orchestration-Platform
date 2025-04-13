import { Component, OnInit, OnDestroy } from '@angular/core';
import { KubernetesService } from '../../services/kubernetes.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class DashboardComponent implements OnInit, OnDestroy {
  pods: any[] = [];
  loadBalancers: any[] = [];
  podForm: FormGroup;
  lbForm: FormGroup;
  selectedNamespace = 'default';
  userId = 'user1'; // In a real app, this would come from authentication
  serviceUrl: string | null = null;
  selectedPods: string[] = [];
  refreshInterval: Subscription | null = null;

  constructor(
    private kubernetesService: KubernetesService,
    private fb: FormBuilder
  ) {
    this.podForm = this.fb.group({
      namespace: ['default', Validators.required],
      podName: ['', Validators.required],
      imageName: ['', Validators.required],
      cpuLimit: ['500m'],
      memoryLimit: ['512Mi'],
      port: [80],
      protocol: ['TCP']
    });

    this.lbForm = this.fb.group({
      namespace: ['default', Validators.required],
      name: ['', Validators.required],
      port: [80],
      protocol: ['TCP']
    });
  }

  ngOnInit(): void {
    this.loadPods();
    this.loadLoadBalancers();
    
    // Set up auto-refresh every 30 seconds
    this.refreshInterval = interval(30000).subscribe(() => {
      this.loadPods();
      this.loadLoadBalancers();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
  }

  loadPods(): void {
    this.kubernetesService.getPods(this.selectedNamespace, this.userId)
      .subscribe({
        next: (response) => {
          this.pods = response.pods;
          // Filter out pods that are already selected but no longer exist
          this.selectedPods = this.selectedPods.filter(podName => 
            this.pods.some(pod => pod.name === podName)
          );
        },
        error: (error) => console.error('Error loading pods:', error)
      });
  }

  loadLoadBalancers(): void {
    this.kubernetesService.getLoadBalancers(this.selectedNamespace, this.userId)
      .subscribe({
        next: (response) => this.loadBalancers = response.loadBalancers,
        error: (error) => console.error('Error loading load balancers:', error)
      });
  }

  createPod(): void {
    if (this.podForm.valid) {
      const podData = {
        ...this.podForm.value,
        userId: this.userId
      };
      this.kubernetesService.createPod(podData)
        .subscribe({
          next: () => {
            this.loadPods();
            this.podForm.patchValue({
              imageName: '',
              podName: ''
            });
          },
          error: (error) => {
            console.error('Error creating pod:', error);
            // Show error message to user
            alert('Failed to create pod: ' + (error.error?.error || 'Unknown error'));
          }
        });
    }
  }

  createLoadBalancer(): void {
    if (this.lbForm.valid && this.selectedPods.length > 0) {
      const lbData = {
        ...this.lbForm.value,
        userId: this.userId,
        podSelectors: this.selectedPods
      };
      this.kubernetesService.createLoadBalancer(lbData)
        .subscribe({
          next: () => {
            this.loadLoadBalancers();
            this.lbForm.patchValue({
              name: ''
            });
            this.selectedPods = [];
          },
          error: (error) => {
            console.error('Error creating load balancer:', error);
            alert('Failed to create load balancer: ' + (error.error?.error || 'Unknown error'));
          }
        });
    } else if (this.selectedPods.length === 0) {
      alert('Please select at least one pod for the load balancer');
    }
  }

  deletePod(podName: string): void {
    if (confirm('Are you sure you want to delete this pod?')) {
      this.kubernetesService.deletePod(this.selectedNamespace, podName, this.userId)
        .subscribe({
          next: () => {
            this.loadPods();
            this.selectedPods = this.selectedPods.filter(pod => pod !== podName);
          },
          error: (error) => {
            console.error('Error deleting pod:', error);
            alert('Failed to delete pod: ' + (error.error?.error || 'Unknown error'));
          }
        });
    }
  }

  deleteLoadBalancer(name: string): void {
    if (confirm('Are you sure you want to delete this load balancer?')) {
      this.kubernetesService.deleteLoadBalancer(this.selectedNamespace, name, this.userId)
        .subscribe({
          next: () => this.loadLoadBalancers(),
          error: (error) => {
            console.error('Error deleting load balancer:', error);
            alert('Failed to delete load balancer: ' + (error.error?.error || 'Unknown error'));
          }
        });
    }
  }

  getServiceUrl(name: string): void {
    this.kubernetesService.getServiceUrl(this.selectedNamespace, name, this.userId)
      .subscribe({
        next: (response) => {
          this.serviceUrl = response.url;
          if (this.serviceUrl) {
            // Copy to clipboard
            navigator.clipboard.writeText(this.serviceUrl).then(() => {
              alert('Service URL copied to clipboard!');
            });
          }
        },
        error: (error) => {
          console.error('Error getting service URL:', error);
          alert('Failed to get service URL: ' + (error.error?.error || 'Unknown error'));
        }
      });
  }

  togglePodSelection(podName: string): void {
    const index = this.selectedPods.indexOf(podName);
    if (index === -1) {
      this.selectedPods.push(podName);
    } else {
      this.selectedPods.splice(index, 1);
    }
  }

  isPodSelected(podName: string): boolean {
    return this.selectedPods.includes(podName);
  }

  refreshData(): void {
    this.loadPods();
    this.loadLoadBalancers();
  }
}