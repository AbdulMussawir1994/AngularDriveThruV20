import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { LoginComponent } from "./login/login.component";
import { AuthRoleGuard } from "./guards/auth.guard";
import { RegisterComponent } from "./register/register.component";

const routes: Routes = [
  // Public routes first
  {
    path: "login",
    component: LoginComponent,
    title: "Login Page",
  },
  {
    path: "register",
    component: RegisterComponent,
    title: "Register Page",
  },

  // Protected admin layout
  {
    path: "",
    component: AdminLayoutComponent,
    canActivateChild: [AuthRoleGuard],
    data: { roles: ["User"] },
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

  // Default redirect
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },

  // Catch-all route (unknown)
  {
    path: "**",
    redirectTo: "login",
  },
];


@NgModule({
  imports: [CommonModule, BrowserModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
