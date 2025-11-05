import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { AuthService } from "services/AuthService";
import { ApiResponse } from "interface/ApiResponse";

declare const $: any;

interface RouteInfo {
  path?: string;
  title: string;
  icon?: string;
  class?: string;
  children?: RouteInfo[];
}

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
  standalone: false,
})
export class SidebarComponent implements OnInit {
  menuItems: RouteInfo[] = [];
  expanded: string | null = null;
  activeChild: string | null = null;

  constructor(private router: Router, private Auth: AuthService) {}

  ngOnInit() {
    this.FetchRoles();

    // ✅ Highlight menu on route change
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        const parent = this.menuItems.find((item) =>
          item.children?.some((child) => url.startsWith(child.path!))
        );
        this.expanded = parent ? parent.title : null;
        this.activeChild = url;
      });
  }

  // ✅ Dynamic roles fetch
  FetchRoles(): void {
    const userId = this.Auth.getClaims();

    if (!userId) {
      console.warn("⚠️ No user ID found in token — skipping FetchRoles()");
      return;
    }

    this.Auth.GetRolesById(userId).subscribe({
      next: (res: ApiResponse<any[]>) => {
      //  console.log("✅ Roles fetched successfully:", res);

        if (res?.data && Array.isArray(res.data)) {
          // Map roles → menu items
          this.menuItems = res.data
            .filter((r) => r.allow) // show only allowed
            .sort((a, b) => a.orderNum - b.orderNum)
            .map((r) => ({
              path: r.path,
              title: r.entityCode,
              icon: r.icon,
              class: "",
            }));
        } else {
          console.warn("⚠️ No valid menu data found in API response");
        }
      },
      error: (err) => {
        console.error("❌ Error fetching roles:", err);
      },
    });
  }

  toggleSubmenu(title: string): void {
    this.expanded = this.expanded === title ? null : title;
  }

  isActiveChild(path: string): boolean {
    return this.activeChild === path;
  }

  isMobileMenu(): boolean {
    return $(window).width() <= 991;
  }

  LogOut(): void {
    this.Auth.logOut();
  }
}