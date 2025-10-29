import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: "app-add-outlet",
  standalone: false, // ✅ Using module-based structure
  templateUrl: "./add-outlet.component.html",
  styleUrls: ["./add-outlet.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush, // ⚡ Performance boost
})
export class AddOutletComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form!: FormGroup;
  isSubmitting = false;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      outletName: ["", [Validators.required, Validators.minLength(3)]],
      arabicOutletName: ["", Validators.required],
      outletNo: [null, [Validators.required, Validators.min(1)]],
      currency: [1, Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      address: ["", Validators.required],
      status: ["1", Validators.required],
      delivery: ["1", Validators.required],
      pickup: ["1", Validators.required],
      dinein: ["0", Validators.required],
    });
  }

  submitOutlet(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    console.log("Form", this.form.value);

    // Simulate async save
    setTimeout(() => {
      alert("Outlet added successfully ✅");
      this.isSubmitting = false;
      this.router.navigate(["/outlet"]);
    }, 1000);
  }

  cancel(): void {
    this.router.navigate(["/outlet"]);
  }

  // Small helper for validation messages
  getControl(name: string) {
    return this.form.get(name);
  }
}
