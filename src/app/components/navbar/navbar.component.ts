import { Component, OnInit, ElementRef } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "services/AuthService";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";
import { ApiResponse } from "interface/ApiResponse";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
  standalone: false,
})
export class NavbarComponent implements OnInit {
  listTitles: any[] = [];
  location: Location;
  mobile_menu_visible: any = 0;
  private toggleButton: any;
  private sidebarVisible = false;

  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    private auth: AuthService
  ) {
    this.location = location;
  }

  ngOnInit() {
    this.fetchRoutesFromApi();

    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName("navbar-toggler")[0];

    this.router.events.subscribe(() => {
      this.sidebarClose();
      const layer = document.getElementsByClassName("close-layer")[0];
      if (layer) {
        layer.remove();
        this.mobile_menu_visible = 0;
      }
    });
  }

  // ✅ Load routes dynamically from API
  fetchRoutesFromApi() {
    const userId = this.auth.getClaims();
    if (!userId) {
      console.warn("⚠️ No valid user token");
      this.auth.logOut();
      return;
    }

    this.auth
      .GetRolesById(userId)
      .pipe(
        catchError((err) => {
          console.error("Error fetching routes:", err);
          return of({ data: [] } as ApiResponse<any[]>);
        })
      )
      .subscribe((res: ApiResponse<any[]>) => {
        if (res && Array.isArray(res.data)) {
         // console.log("✅ API Response:", res.data);

          this.listTitles = res.data
            .filter((item) => item.allow)
            .map((item) => ({
              path: item.path
                ? item.path.toLowerCase()
                : `/${item.entityCode.toLowerCase()}`,
              title: item.entityCode,
              icon: item.icon || "",
            }));

        //  console.log("✅ Final mapped routes:", this.listTitles);
        } else {
          this.listTitles = [];
        }
      });
  }
  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName("body")[0];
    setTimeout(() => toggleButton.classList.add("toggled"), 500);
    body.classList.add("nav-open");
    this.sidebarVisible = true;
  }

  sidebarClose() {
    const body = document.getElementsByTagName("body")[0];
    this.toggleButton.classList.remove("toggled");
    this.sidebarVisible = false;
    body.classList.remove("nav-open");
  }

  sidebarToggle() {
    const toggle = document.getElementsByClassName("navbar-toggler")[0];
    const body = document.getElementsByTagName("body")[0];
    const existingLayer = document.getElementsByClassName("close-layer")[0];

    if (this.sidebarVisible) {
      this.sidebarClose();
    } else {
      this.sidebarOpen();
    }

    if (this.mobile_menu_visible === 1) {
      body.classList.remove("nav-open");
      if (existingLayer) existingLayer.remove();
      setTimeout(() => toggle.classList.remove("toggled"), 400);
      this.mobile_menu_visible = 0;
    } else {
      setTimeout(() => toggle.classList.add("toggled"), 430);
      const layer = document.createElement("div");
      layer.setAttribute("class", "close-layer");

      const panel =
        body.querySelector(".main-panel") ||
        body.querySelector(".wrapper-full-page");
      if (panel) panel.appendChild(layer);

      setTimeout(() => layer.classList.add("visible"), 100);

      layer.onclick = () => {
        body.classList.remove("nav-open");
        this.mobile_menu_visible = 0;
        layer.classList.remove("visible");
        setTimeout(() => {
          layer.remove();
          toggle.classList.remove("toggled");
        }, 400);
      };

      body.classList.add("nav-open");
      this.mobile_menu_visible = 1;
    }
  }

  getTitle() {
    const titlePath = this.location
      .prepareExternalUrl(this.location.path())
      .replace(/^#/, "");
    const found = this.listTitles.find((item) => item.path === titlePath);
    return found ? found.title : "";
  }

  logout(): void {
    this.auth.logOut();
  }
}
