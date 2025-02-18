import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/allapis.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      isAdmin: [false]
    });
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    if (this.registerForm.valid) {
      const user = {
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        isAdmin: this.registerForm.value.isAdmin
      };

      try {
        const response = await this.apiService.post('/register', user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('isAdmin', response.isAdmin);
        this.router.navigate(['/homepage']);
      } catch (error) {
        console.error('Error registering user', error);
      }
    }
  }

  switchToLogin() {
    this.router.navigate(['/login']);
  }
}