import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  computed,
  signal,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { Outlet } from "interface/Outlet";
import { OutletService } from "services/OutletService";

@Component({
  selector: "app-outlet",
  standalone: false,
  templateUrl: "./outlet.component.html",
  styleUrls: ["./outlet.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutletComponent implements OnInit {
  /** 🧠 Signals for State */
  outlets = signal<Outlet[]>([]);
  filteredOutlets = signal<Outlet[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  private readonly pageSize = 5;

  /** 🔍 Reactive Search Form */
  searchForm!: FormGroup;

  /** 📄 Computed for Pagination */
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredOutlets().length / this.pageSize))
  );

  paginatedOutlets = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredOutlets().slice(start, start + this.pageSize);
  });

  constructor(private fb: FormBuilder, private outletService: OutletService) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      name: [""],
      address: [""],
      status: [""], // can be "true", "false", or ""
      delivery: [""],
      pickup: [""],
      dinein: [""],
    });

    this.loadOutlets();

    // 🕒 Debounced search for better performance
    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.applyLocalFilter());
  }

  /** 🌐 Load outlets from API */
  private loadOutlets(): void {
    this.loading.set(true);
    this.error.set(null);

    this.outletService.list().subscribe({
      next: (res) => {
        if (res && Array.isArray(res.data)) {
          // Normalize boolean & string casing
          const transformed = res.data.map((item: any) => ({
            ...item,
            name: this.capitalize(item.name),
            address: this.capitalize(item.address),
            // ensure boolean fields are true/false, not strings
            status:
              typeof item.status === "boolean"
                ? item.status
                : item.status?.toString().toLowerCase() === "true",
            delivery:
              typeof item.delivery === "boolean"
                ? item.delivery
                : item.delivery?.toString().toLowerCase() === "true",
            pickup:
              typeof item.pickup === "boolean"
                ? item.pickup
                : item.pickup?.toString().toLowerCase() === "true",
            dinein:
              typeof item.dinein === "boolean"
                ? item.dinein
                : item.dinein?.toString().toLowerCase() === "true",
          }));

          this.outlets.set(transformed);
          this.filteredOutlets.set(transformed);
        } else {
          console.warn("⚠️ Invalid or empty response");
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Failed to load outlets");
        this.loading.set(false);
      },
    });
  }

  /** 🔎 Local Filter (supports string + boolean fields) */
  private applyLocalFilter(): void {
    const f = this.searchForm.value;

    const filtered = this.outlets().filter((o) => {
      const matchText = (field: string, value: string) =>
        !value ||
        (field || "").toLowerCase().includes(value.toLowerCase().trim());

      const matchBool = (field: boolean, value: string) => {
        if (value === "") return true; // no filter applied
        const boolVal = value === "true";
        return field === boolVal;
      };

      return (
        matchText(o.name, f.name) &&
        matchText(o.address, f.address) &&
        matchBool(o.status, f.status) &&
        matchBool(o.delivery, f.delivery) &&
        matchBool(o.pickup, f.pickup) &&
        matchBool(o.dinein, f.dinein)
      );
    });

    this.filteredOutlets.set(filtered);
    this.currentPage.set(1);
  }

  /** 🧹 Capitalize Helper */
  private capitalize(str: string): string {
    return typeof str === "string"
      ? str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
      : str;
  }

  /** 🗑 Optimistic Delete */
  deleteOutlet(id: number): void {
    if (!confirm("Are you sure you want to delete this outlet?")) return;
    const backup = [...this.outlets()];
    const updated = backup.filter((x) => x.id !== id);

    this.outlets.set(updated);
    this.applyLocalFilter();

    this.outletService.delete(id).subscribe({
      next: () => {},
      error: () => {
        this.outlets.set(backup);
        this.applyLocalFilter();
        this.error.set("Failed to delete outlet");
      },
    });
  }

  /** ⏭ Pagination Controls */
  nextPage(): void {
    if (this.currentPage() < this.totalPages())
      this.currentPage.update((v) => v + 1);
  }

  prevPage(): void {
    if (this.currentPage() > 1)
      this.currentPage.update((v) => v - 1);
  }

  /** ⚡ trackBy for High Performance */
  trackById(_: number, item: Outlet): number {
    return item.id!;
  }
}