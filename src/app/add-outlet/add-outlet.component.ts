import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Outlet } from "interface/Outlet";

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

  outlet: Outlet = {
    id: 0,
    name: "Main Street Location",
    address: "123 Main Street, City, ST 123456",
    status: false,
    delivery: false,
    pickup: false,
    dinein: false,
    phone: "(555) 123-4567",
    timeZone: "Eastern Time",
    openingTime: new Date(new Date().setHours(17, 0, 0, 0)), // ✅ 5:00 PM today
    closingTime: new Date(new Date().setHours(23, 0, 0, 0)), // ✅ 5:00 PM today
    goalSummary: "",
    breakFastStart: new Date(new Date().setHours(6, 0, 0, 0)), // ✅ 5:00 PM today
    breakFastEnd: new Date(new Date().setHours(12, 0, 0, 0)), // ✅ 5:00 PM today
    lunchStart: new Date(new Date().setHours(12, 0, 0, 0)), // ✅ 5:00 PM today
    lunchEnd: new Date(new Date().setHours(16, 0, 0, 0)), // ✅ 5:00 PM today
    dinnerStart: new Date(new Date().setHours(16, 0, 0, 0)), // ✅ 5:00 PM today
    dinnerEnd: new Date(new Date().setHours(23, 0, 0, 0)), // ✅ 5:00 PM today
  };

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
      alert("Form submitted successfully ✅");
      this.isSubmitting = false;
      this.router.navigate(["/outlets"]);
    }, 1000);
  }

  cancel(): void {
    this.router.navigate(["/outlets"]);
  }

  // Small helper for validation messages
  getControl(name: string) {
    return this.form.get(name);
  }

  /** ✅ Computed getter - lightweight and clean */
  get isOpenNow(): boolean {
    const outlet = this.outlet;
    if (!outlet?.openingTime || !outlet?.closingTime) return false;

    const now = new Date();
    return (
      now >= new Date(outlet.openingTime) && now <= new Date(outlet.closingTime)
    );
  }
}
