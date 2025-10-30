import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { Outlet } from "interface/Outlet";

@Component({
  selector: "app-store",
  templateUrl: "./store.component.html",
  styleUrls: ["./store.component.scss"],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush // 🚀 boosts performance
})
export class StoreComponent implements OnInit {
  private http = inject(HttpClient);

  // ✅ Correctly typed variable with an initial empty object
  outlet: Outlet = {
    id: 0,
    name: "",
    address: "",
    status: "",
    delivery: "",
    pickup: "",
    dinein: "",
    phone: "",
    timeZone: null,
    openingTime: null,
    closingTime: null,
    goalSummary: "",
  };

  ngOnInit(): void {
    this.loadOutlet();
  }

  loadOutlet(): void {
    // this.http.get<Outlet>('/api/outlet/details').subscribe({
    //   next: (data) => (this.outlet = data),
    //   error: (err) => console.error('Failed to load outlet info:', err),
    // });
  }

   /** ✅ Computed getter - lightweight and clean */
  get isOpenNow(): boolean {
    const outlet = this.outlet;
    if (!outlet?.openingTime || !outlet?.closingTime) return false;

    const now = new Date();
    return now >= new Date(outlet.openingTime) && now <= new Date(outlet.closingTime);
  }

}
