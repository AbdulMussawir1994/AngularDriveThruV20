import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";

declare const $: any;

interface RouteInfo {
  path?: string;
  title: string;
  icon?: string;
  class?: string;
  children?: RouteInfo[];
}

export const ROUTES: RouteInfo[] = [
  { path: "/dashboard", title: "Dashboard", icon: "dashboard", class: "" },
  { path: "/outlet", title: "Outlet Management", icon: "store", class: "" },
  // {
  //   title: "Outlet Management",
  //   icon: "arrow_drop_down_circle",
  //   class: "",
  //   children: [
  //     { path: "/outlet", title: "Outlet List", icon: "list", class: "" },
  //     { path: "/outlet/add", title: "Add Outlet", icon: "add", class: "" },
  //     {
  //       path: "/outlet/email",
  //       title: "Email Outlets",
  //       icon: "email",
  //       class: "",
  //     },
  //   ],
  // },
  //{ path: "/store", title: "Store", icon: "store", class: "" },
  { path: "/user-profile", title: "User Profile", icon: "person", class: "" },
  {
    path: "/table-list",
    title: "Reports",
    icon: "content_paste",
    class: "",
  },
  // {
  //   path: "/notifications",
  //   title: "Notifications",
  //   icon: "notifications",
  //   class: "",
  // },
  // {
  //   path: "/upgrade",
  //   title: "Upgrade to PRO",
  //   icon: "unarchive",
  //   class: "active-pro",
  // },
];

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

  constructor(private router: Router) {}

  ngOnInit() {
    this.menuItems = ROUTES;

    // ✅ Automatically close submenu when navigating elsewhere
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;

        // Highlight correct submenu if user directly navigates via URL
        const parent = this.menuItems.find((item) =>
          item.children?.some((child) => url.startsWith(child.path!))
        );
        this.expanded = parent ? parent.title : null;

        // Highlight only the active submenu item
        this.activeChild = url;
      });
  }

  toggleSubmenu(title: string): void {
    // Toggle submenu open/close
    this.expanded = this.expanded === title ? null : title;
  }

  isActiveChild(path: string): boolean {
    return this.activeChild === path;
  }

  isMobileMenu(): boolean {
    return $(window).width() <= 991;
  }
}
