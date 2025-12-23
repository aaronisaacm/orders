import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = signal('');
  password = signal('');
  error = signal<string | null>(null);
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error.set(null);
    this.isLoading.set(true);

    const username = this.username();
    const password = this.password();

    if (!username || !password) {
      this.error.set('Please enter both username and password');
      this.isLoading.set(false);
      return;
    }

    // Attempt login
    this.authService.login(username, password).subscribe({
      next: (success) => {
        this.isLoading.set(false);
        if (success) {
          // Navigate to orders page
          this.router.navigate(['/orders']);
        } else {
          this.error.set('Login failed. Please try again.');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.error.set('Login failed. Invalid username or password.');
        console.error('Login error:', error);
      }
    });
  }
}

