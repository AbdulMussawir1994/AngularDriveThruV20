import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";

import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { LoginComponent } from "./login/login.component";
import { AuthRoleGuard } from "./guards/auth.guard";

const routes: Routes = [
  // ✅ Default route — show login page
  {
    path: "",
    component: LoginComponent,
    title: "Login Page",
  },

  {
    path: "",
    component: AdminLayoutComponent,
    canActivateChild: [AuthRoleGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./layouts/admin-layout/admin-layout.module").then(
            (m) => m.AdminLayoutModule
          ),
      },
    ],
  },

  // ✅ Explicit login route (optional)
  {
    path: "login",
    component: LoginComponent,
    title: "Login Page",
  },

  // ✅ Catch-all route (redirect unknown routes)
  {
    path: "**",
    redirectTo: "",
  },
];

@NgModule({
  imports: [CommonModule, BrowserModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
