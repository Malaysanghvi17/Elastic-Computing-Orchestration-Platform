import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KubernetesService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Pods
  getPods(namespace: string, userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pods/${namespace}?userId=${userId}`);
  }

  createPod(podData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/pods`, podData);
  }

  deletePod(namespace: string, podName: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pods/${namespace}/${podName}?userId=${userId}`);
  }

  // Load Balancers
  getLoadBalancers(namespace: string, userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/loadbalancers/${namespace}?userId=${userId}`);
  }

  createLoadBalancer(lbData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/loadbalancers`, lbData);
  }

  deleteLoadBalancer(namespace: string, name: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/loadbalancers/${namespace}/${name}?userId=${userId}`);
  }

  // Service URL
  getServiceUrl(namespace: string, name: string, userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/services/${namespace}/${name}/url?userId=${userId}`);
  }
}