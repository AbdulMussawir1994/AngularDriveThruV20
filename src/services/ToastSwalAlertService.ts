import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class ToastSwalAlertService {
  constructor() {}

  // this.showError('Oops', 'Something went wrong!');
  public showError(title: string, text: string): void {
    Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#d33',
    });
  }

  // this.showSuccess('Saved', 'Employee added successfully!');
  public showSuccess(title: string, text: string): void {
    Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#28a745', // green
    });
  }

  // this.showWarning('Are you sure?', 'You are about to delete this employee.');
  public showWarning(title: string, text: string): void {
    Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: '#ffc107', // amber
    });
  }

  // this.showInfo('Reminder', 'Session will expire in 1 minute.');
  public showInfo(title: string, text: string): void {
    Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonColor: '#17a2b8', // blue/cyan
    });
  }

  //this.showToast('success', 'Employee saved successfully!');
  public showToast(
    type: 'success' | 'info' | 'warning' | 'error',
    message: string
  ): void {
    Swal.fire({
      icon: type,
      title: message,
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false,
      timerProgressBar: true,
    });
  }
}