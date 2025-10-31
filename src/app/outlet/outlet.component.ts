import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  computed,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { OutletService } from 'services/outlet-service';
import { Outlet } from 'interface/Outlet';

@Component({
  selector: 'app-outlet',
  standalone: false,
  templateUrl: './outlet.component.html',
  styleUrls: ['./outlet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutletComponent implements OnInit {
  /** 🧠 Reactive Signals for State */
  outlets = signal<Outlet[]>([]);
  filteredOutlets = signal<Outlet[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  private readonly pageSize = 5;

  /** 🔍 Reactive Search Form */
  searchForm!: FormGroup;

  /** 📄 Computed Signals for Pagination */
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
      name: [''],
      address: [''],
      status: [''],
      delivery: [''],
      pickup: [''],
      dinein: [''],
    });

    this.loadOutlets();

    // 🎯 Debounced search — only triggers after 300ms pause
    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.applyLocalFilter());
  }

  /** 🌐 Load all outlets from backend API */
  private loadOutlets(): void {
    this.loading.set(true);
    this.error.set(null);

    this.outletService.list().subscribe({
      next: (res) => {
        this.outlets.set(res);
        this.filteredOutlets.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load outlets');
        this.loading.set(false);
      },
    });
  }

  /** 🔎 Local filtering (client-side) */
  private applyLocalFilter(): void {
    const filters = this.searchForm.value;
    const filtered = this.outlets().filter((o) =>
      (!filters.name ||
        o.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.address ||
        o.address.toLowerCase().includes(filters.address.toLowerCase())) &&
      (!filters.status ||
        o.status.toLowerCase().includes(filters.status.toLowerCase())) &&
      (!filters.delivery ||
        o.delivery.toLowerCase().includes(filters.delivery.toLowerCase())) &&
      (!filters.pickup ||
        o.pickup.toLowerCase().includes(filters.pickup.toLowerCase())) &&
      (!filters.dinein ||
        o.dinein.toLowerCase().includes(filters.dinein.toLowerCase()))
    );

    this.filteredOutlets.set(filtered);
    this.currentPage.set(1);
  }

  /** 🗑 Delete outlet via API (optimistic update) */
  deleteOutlet(id: number): void {
    if (!confirm('Are you sure you want to delete this outlet?')) return;

    const snapshot = [...this.outlets()];
    const updated = snapshot.filter((o) => o.id !== id);
    this.outlets.set(updated);
    this.applyLocalFilter();

    this.outletService.delete(id).subscribe({
      next: () => {},
      error: () => {
        this.outlets.set(snapshot);
        this.applyLocalFilter();
        this.error.set('Failed to delete outlet');
      },
    });
  }

  /** 📄 Pagination Controls */
  nextPage(): void {
    if (this.currentPage() < this.totalPages())
      this.currentPage.update((v) => v + 1);
  }

  prevPage(): void {
    if (this.currentPage() > 1)
      this.currentPage.update((v) => v - 1);
  }

  /** 🔁 Track By ID for high performance ngFor */
  trackById(_: number, item: Outlet): number {
    return item.id!;
  }
}
