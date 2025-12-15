import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

interface LoginResponse {
  username: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'auth_credentials';
  private readonly USERNAME_KEY = 'auth_username';
  private readonly baseUrl = (typeof window !== 'undefined' && (window as any).__API_URL__) 
    ? (window as any).__API_URL__
    : 'http://localhost:5146';
  
  // Signal to track authentication state
  isAuthenticated = signal<boolean>(false);
  username = signal<string | null>(null);

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Check if user is already authenticated on service initialization
    this.checkAuthStatus();
  }

  /**
   * Login with username and password
   * Validates credentials against backend and stores them if successful
   * @returns Observable<boolean> true if login successful, false otherwise
   */
  login(username: string, password: string): Observable<boolean> {
    // Create Basic Auth token
    const credentials = btoa(`${username}:${password}`);
    const authHeader = `Basic ${credentials}`;
    
    const headers = new HttpHeaders({
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, {}, { headers, observe: 'response' })
      .pipe(
        map(response => {
          if (response.status === 200 && response.body) {
            // Store credentials in sessionStorage
            sessionStorage.setItem(this.STORAGE_KEY, credentials);
            sessionStorage.setItem(this.USERNAME_KEY, username);
            
            // Update signals
            this.isAuthenticated.set(true);
            this.username.set(username);
            
            return true;
          }
          return false;
        }),
        catchError(error => {
          console.error('Login error:', error);
          // Clear any stored credentials on error
          this.clearCredentials();
          return throwError(() => error);
        })
      );
  }

  /**
   * Clear stored credentials
   */
  private clearCredentials(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.USERNAME_KEY);
    this.isAuthenticated.set(false);
    this.username.set(null);
  }

  /**
   * Logout and clear credentials
   */
  logout(): void {
    this.clearCredentials();
    this.router.navigate(['/login']);
  }

  /**
   * Get the stored credentials (base64 encoded)
   */
  getCredentials(): string | null {
    return sessionStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Get the Authorization header value
   */
  getAuthHeader(): string | null {
    const credentials = this.getCredentials();
    return credentials ? `Basic ${credentials}` : null;
  }

  /**
   * Check if user is authenticated
   */
  private checkAuthStatus(): void {
    const credentials = this.getCredentials();
    const username = sessionStorage.getItem(this.USERNAME_KEY);
    
    if (credentials && username) {
      this.isAuthenticated.set(true);
      this.username.set(username);
    } else {
      this.isAuthenticated.set(false);
      this.username.set(null);
    }
  }
}

