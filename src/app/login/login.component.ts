import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { AuthService } from 'services/AuthService';
import { ToastSwalAlertService } from 'services/ToastSwalAlertService';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
private fb = inject(FormBuilder);
  
private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private toastAlert = inject(ToastSwalAlertService);

  signInForm!: FormGroup;
  loading = false;
  bubbles = Array(10);

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: [
        '',
        [Validators.required, Validators.minLength(6)],
      ],
    });
  }

  get f() {
    return this.signInForm.controls;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.f[field];
    return control && (control.touched || control.dirty) && control.invalid;
  }

  getFieldError(field: string): string {
    const control = this.f[field];
    if (!control || !control.errors) return '';

    const fieldLabel =
      field === 'userName'
        ? 'Username'
        : field.charAt(0).toUpperCase() + field.slice(1);

    if (control.errors['required']) return `${fieldLabel} is required.`;
    if (control.errors['minlength'])
      return `${fieldLabel} must be at least ${control.errors['minlength'].requiredLength} characters.`;

    return `Invalid ${fieldLabel.toLowerCase()}.`;
  }

  onSubmit(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const credentials = this.signInForm.value;

    this.authService
      .loginUser(credentials)
      .pipe(take(1))
      .subscribe({
        next: async ({ status, data, message }) => {
          console.log("Login Res", data)
          if (status) {
            debugger
            await this.authService.saveSession(data);
            //this.toastr.success('Login successful', 'Success');
            //this.toastAlert.showToast('success', 'Login successful1');
            this.toastAlert.showSuccess('success', 'Login successful');
            // Swal.fire({
            //   icon: 'success',
            //   title: 'Login Successful',
            //   toast: true,
            //   timer: 1200,
            //   showConfirmButton: false,
            //   position: 'top-end',
            // });
            console.log("Wroking");
            this.router.navigateByUrl('/outlet');
          } else {
            // this.toastr.error(status.statusMessage, 'Login Failed');
            this.toastAlert.showError('Login Failed', message);
            this.loading = false;
          }
        },
        error: (err) => {
          const msg = err?.message?.includes('Network Error')
            ? 'Check your internet connection.'
            : 'An unexpected error occurred.';
          //this.toastr.error(msg, 'Server Error');
          this.toastAlert.showError('Server Error', msg);
          this.loading = false;
        },
        complete: () => (this.loading = false),
      });
  }
}
