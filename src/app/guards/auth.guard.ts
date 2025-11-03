import { inject, Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "services/AuthService";

@Injectable({ providedIn: "root" })
export class AuthRoleGuard implements CanActivate, CanActivateChild {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.checkAccess(route, state);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.checkAccess(route, state);
  }

  private checkAccess(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    // 🔒 1. Check authentication
    if (!this.auth.isLoggedIn()) {
      this.auth.sessionExpired();
      console.warn("AuthRoleGuard → User not logged in, redirecting to login");
      return this.router.createUrlTree(["/login"], {
        queryParams: { returnUrl: state.url },
      });
    }

    // 🔑 2. Check role-based access (optional)
    const expectedRoles = route.data["roles"] as string[] ?? [];
    if (expectedRoles.length && !this.auth.hasAnyRole(expectedRoles)) {
      console.warn("AuthRoleGuard → Access denied for roles", expectedRoles);
      this.toastr.error(
        "Access denied. You don’t have permission to view this page.",
        "Permission Denied"
      );
      return this.router.createUrlTree(["/forbidden"]);
    }

    return true;
  }
}