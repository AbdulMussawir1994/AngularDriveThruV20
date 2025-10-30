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


  ngOnInit(): void {
    this.loadOutlet();
  }

  loadOutlet(): void {
    // this.http.get<Outlet>('/api/outlet/details').subscribe({
    //   next: (data) => (this.outlet = data),
    //   error: (err) => console.error('Failed to load outlet info:', err),
    // });
  }


}
