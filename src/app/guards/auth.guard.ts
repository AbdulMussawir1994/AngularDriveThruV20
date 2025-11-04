import { Injectable, inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { AuthService } from "services/AuthService";
import { ToastSwalAlertService } from "services/ToastSwalAlertService";

@Injectable({ providedIn: "root" })
export class AuthRoleGuard implements CanActivate, CanActivateChild {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  
  constructor(private toastr: ToastSwalAlertService) {} // ✅ Proper injection

  private cachedRoles: string[] | null = null;

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.checkAccess(route, state);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.checkAccess(route, state);
  }

  private checkAccess(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    // 🔒 1. Authentication check
    if (!this.auth.isLoggedIn()) {
      this.auth.sessionExpired();
      return this.router.createUrlTree(["/login"], {
        queryParams: { returnUrl: state.url },
      });
    }

    // 🔑 2. Role-based authorization
    const expectedRoles = route.data["roles"] as string[] | undefined;
    if (expectedRoles?.length) {
      this.cachedRoles ??= this.auth.getUserRoles();
      const hasAccess = expectedRoles.some((r) =>
        this.cachedRoles!.includes(r)
      );

      if (!hasAccess) {
        this.toastr.showError(
          "",
          "Access denied. You don’t have permission to view this page."
        );
        return this.router.createUrlTree(["/dashboard"]);
      }
    }

    return true;
  }
}
