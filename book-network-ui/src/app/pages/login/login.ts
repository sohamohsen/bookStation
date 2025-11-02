import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgForOf, NgClass } from '@angular/common';
import { AuthenticationRequest } from '../../services/models/authentication-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf, NgClass],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  authRequest: AuthenticationRequest = {
    email: '',
    password: ''
  };

  errorMsg: string[] = [];
  showPassword = false;
  loginStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login(form: any) {
    if (form.invalid) {
      this.errorMsg = ['Please fill the form correctly'];
      return;
    }

    this.loginStatus = 'loading';
    this.errorMsg = [];

    // TODO: call your auth service here
    // on success → this.loginStatus = 'success';
    // on error → this.loginStatus = 'error'; this.errorMsg = ['Invalid email or password'];
  }

  forgotPassword() {
    // navigate or show modal
  }

  register() {
    // navigate to register
  }
}
