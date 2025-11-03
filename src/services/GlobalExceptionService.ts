import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject, Injector } from "@angular/core";
import { throwError } from "rxjs";
import { AuthService } from "./AuthService";

@Injectable({ providedIn: 'root' })
export class GlobalExceptionService {
  private injector = inject(Injector);

  getErrorHandler = (error: any) => {
    const authService = this.injector.get(AuthService);
    console.log('Error', error);

    if (error?.error?.status?.isSuccess === false) {
      // Immediately throw the error
      const errorMessage =
        error?.error?.status?.statusMessage || 'An unknown error occurred';

      // Clear localStorage after 3 seconds
      setTimeout(() => {
        authService.logoutV2();
        console.log('LocalStorage cleared after error');
      }, 2000);

      return throwError(() => new Error(errorMessage));
    }

    if (error?.message === 'TimeoutError') {
      return throwError(
        () => new Error('The server timed out. Please try again later.')
      );
    }

    if (
      error instanceof HttpErrorResponse &&
      (error.status === 0 || error.statusText === 'Unknown Error')
    ) {
      return throwError(
        () => new Error('Network error: Please check your internet connection.')
      );
    }

    if (error?.error?.message || error?.message) {
      return throwError(
        () => new Error(error?.error?.message || error?.message)
      );
    }

    const validationErrors = error?.error?.errors;
    if (validationErrors && typeof validationErrors === 'object') {
      const firstKey = Object.keys(validationErrors)[0];
      const messages: string[] = validationErrors[firstKey];
      if (Array.isArray(messages) && messages.length > 0) {
        return throwError(() => new Error(messages[0]));
      }
    }

    return throwError(
      () => new Error('Unexpected error occurred. Please try again.')
    );
  };
}
