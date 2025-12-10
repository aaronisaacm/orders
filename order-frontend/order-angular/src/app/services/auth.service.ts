import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'auth_credentials';
  private readonly USERNAME_KEY = 'auth_username';
  
  // Signal to track authentication state
  isAuthenticated = signal<boolean>(false);
  username = signal<string | null>(null);

  constructor(private router: Router) {
    // Check if user is already authenticated on service initialization
    this.checkAuthStatus();
  }

  /**
   * Login with username and password
   * Stores credentials in sessionStorage (base64 encoded)
   */
  login(username: string, password: string): boolean {
    try {
      // Create Basic Auth token
      const credentials = btoa(`${username}:${password}`);
      
      // Store in sessionStorage
      sessionStorage.setItem(this.STORAGE_KEY, credentials);
      sessionStorage.setItem(this.USERNAME_KEY, username);
      
      // Update signals
      this.isAuthenticated.set(true);
      this.username.set(username);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  /**
   * Logout and clear credentials
   */
  logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.USERNAME_KEY);
    this.isAuthenticated.set(false);
    this.username.set(null);
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

