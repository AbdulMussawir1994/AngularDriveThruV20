import { Component, inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";
import { Router } from "@angular/router";
import { take } from "rxjs";
import { AuthService } from "services/AuthService";
import { ToastSwalAlertService } from "services/ToastSwalAlertService";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
  standalone: false,
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastAlert = inject(ToastSwalAlertService);

  signInForm!: FormGroup;
  loading = false;
  bubbles = Array(10);

  ngOnInit(): void {
    this.signInForm = this.fb.group(
      {
        userName: ["", [Validators.required]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required, Validators.minLength(6)]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // ✅ Custom validator to match password and confirmPassword
  private passwordMatchValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const password = group.get("password")?.value;
    const confirm = group.get("confirmPassword")?.value;
    return password && confirm && password !== confirm
      ? { passwordsMismatch: true }
      : null;
  };

  get f() {
    return this.signInForm.controls;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.f[field];
    if (!control) return false;

    // For confirmPassword, consider group-level validator
    if (
      field === "confirmPassword" &&
      this.signInForm.errors?.passwordsMismatch &&
      (control.dirty || control.touched)
    ) {
      return true;
    }

    return (control.touched || control.dirty) && control.invalid;
  }

  getFieldError(field: string): string {
    const control = this.f[field];
    if (!control) return "";

    let fieldLabel =
      field === "userName"
        ? "Username"
        : field === "confirmPassword"
        ? "Confirm Password"
        : field.charAt(0).toUpperCase() + field.slice(1);

    // Field-level validators
    if (control.errors) {
      if (control.errors["required"]) return `${fieldLabel} is required.`;
      if (control.errors["email"]) return `Please enter a valid email address.`;
      if (control.errors["minlength"])
        return `${fieldLabel} must be at least ${control.errors["minlength"].requiredLength} characters.`;
    }

    // ✅ Form-group-level validator for confirmPassword
    if (
      field === "confirmPassword" &&
      this.signInForm.errors?.passwordsMismatch &&
      (control.dirty || control.touched)
    ) {
      return `Passwords does not match.`;
    }

    return "";
  }

  onSubmit(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const credentials = this.signInForm.value;

    // ✅ Call register API (instead of loginUser)
    this.authService
      .RegisterUser(credentials)
      .pipe(take(1))
      .subscribe({
        next: async ({ status, data, message }) => {
          if (status) {
            this.toastAlert.showSuccess('Success', message);
            this.router.navigateByUrl('/login');
          } else {
            this.toastAlert.showError('Registration Failed', message);
          }
          this.loading = false;
        },
        error: (err) => {
          const msg = err?.message?.includes('Network Error')
            ? 'Check your internet connection.'
            : 'An unexpected error occurred.';
          this.toastAlert.showError('Server Error', msg);
          this.loading = false;
        },
      });
  }
}
