import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import {
  Observable,
  timeout,
  catchError,
  firstValueFrom,
  Observer,
} from "rxjs";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { GlobalExceptionService } from "./GlobalExceptionService";
import {
  LoginRequestModel,
  LoginResponseModel,
  Role,
} from "./LoginRequestModel";
import { ApiResponse } from "interface/ApiResponse";
import { Enums } from "Enums/Enums";
import Swal from "sweetalert2";
import { Buffer } from "buffer";
import { jwtDecode } from "jwt-decode";
import { RegisterViewModel } from "interface/Outlet";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly baseUrl = environment.BaseApiUrl;
  private readonly timeoutMs = 10000;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private exception: GlobalExceptionService
  ) {}

  private get storage(): Storage | null {
    return typeof window !== "undefined" ? localStorage : null;
  }

  private get session(): Storage | null {
    return typeof window !== "undefined" ? sessionStorage : null;
  }

  private handle<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      timeout(this.timeoutMs),
      catchError(this.exception.getErrorHandler)
    );
  }

  loginUser(
    model: LoginRequestModel
  ): Observable<ApiResponse<LoginResponseModel>> {
    return this.handle(
      this.http.post<ApiResponse<LoginResponseModel>>(
        `${this.baseUrl}/login`,
        model
      )
    );
  }

  RegisterUser(
    signupRequest: RegisterViewModel
  ): Observable<ApiResponse<string>> {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });

    return this.http
      .post<ApiResponse<string>>(`${this.baseUrl}/register`, signupRequest, {
        headers,
      })
      .pipe(
        catchError(this.exception.getErrorHandler) // centralized error handling
      );
  }

  GetRolesById(userId: string): Observable<ApiResponse<any[]>> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post<ApiResponse<any[]>>(
        `${this.baseUrl}/GetRolesById`,
        { userId }, // 👈 send object payload
        { headers }
      )
      .pipe(catchError(this.exception.getErrorHandler));
  }

  addRole(model: Role): Observable<ApiResponse<any>> {
    return this.handle(
      this.http.post<ApiResponse<any>>(
        `${this.baseUrl}/UserRoles/CreateRole`,
        model
      )
    );
  }

  getClaims(): string | null {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      // Optional: check expiration
      if (decoded.exp * 1000 < Date.now()) {
     //   console.warn("Token expired");
        this.logOut();
        return null;
      }
      return decoded.sub; // or decoded.id
    } catch (e) {
      console.error("Invalid token");
      this.logOut();
      return null;
    }
  }

  login(model: LoginRequestModel): Observable<ApiResponse<LoginResponseModel>> {
    return this.http
      .post<ApiResponse<LoginResponseModel>>(
        `${this.baseUrl}/User/LoginUser`,
        model
      )
      .pipe(
        timeout(this.timeoutMs),
        catchError(this.exception.getErrorHandler)
      );
  }

  async saveSession(response: LoginResponseModel): Promise<void> {
    await this.saveToken(response.token);
  }

  private async fetchAndSaveRoles(token: string): Promise<void> {
    if (!this.storage) return;

    const headers = new HttpHeaders().set("Authorization", `Bearer ${token}`);
    try {
      const result = await firstValueFrom(
        this.http.get<ApiResponse<string[]>>(
          `${this.baseUrl}/UserRoles/GetUserRolesById`,
          { headers }
        )
      );

      if (result.status && Array.isArray(result.data)) {
        this.storage.setItem(Enums.values.roles, JSON.stringify(result.data));
      }
    } catch (err) {
      console.warn("[AuthService] Failed to fetch roles:", err);
    }
  }

  GetTokenDate(): boolean {
    var token = localStorage.getItem("token");
    if (token != null) {
      var extractdata = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      // console.log("Ext", extractdata);
      const utcDate = new Date(extractdata.exp * 1000);
      if (utcDate.getTime() < Date.now()) {
        return true;
      }
      return false;
    } else {
      return false;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const token = this.getToken();
    const headers = new HttpHeaders().set("Authorization", `Bearer ${token}`);
    console.log("Refresh");
    try {
      const res = await firstValueFrom(
        this.http
          .post<ApiResponse<LoginResponseModel>>(
            `${this.baseUrl}/User/GetRefreshToken`,
            { refreshToken },
            { headers }
          )
          .pipe(
            timeout(this.timeoutMs),
            catchError(this.exception.getErrorHandler)
          )
      );

      if (res.status && res.data) {
        await this.saveToken(res.data.token);
        return res.data.token;
      }

      this.logOut();
      throw new Error(res.message);
    } catch (error) {
      this.logOut();
      throw error;
    }
  }

  async saveToken(token: string): Promise<void> {
    if (!this.storage) return;

    this.storage.setItem(Enums.values.token, token);

    // const expiryTime = new Date(expiry);
    // if (!isNaN(expiryTime.getTime())) {
    //   this.storage.setItem(Enums.values.expiry, expiryTime.toISOString());
    // }

    // await this.fetchAndSaveRoles(token);

    this.GetTokenDate();
   // console.log(this.getUserRoles());
  }

  getToken(): string | null {
   // console.log("Token", this.storage?.getItem(Enums.values.token));
    return this.storage?.getItem(Enums.values.token) ?? null;
  }

  getUserRoles(): string[] {
    const token = localStorage.getItem("token");
    if (!token) return [];

    try {
      // Decode JWT payload
      const base64Payload = token.split(".")[1];
      const jsonPayload = JSON.parse(atob(base64Payload));

      // You can inspect it here
   //   console.log("Decoded Token:", jsonPayload);

      // Extract role claim (your token uses full claim URI)
      const roleClaim =
        jsonPayload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      // Some tokens may have one or multiple roles
      if (Array.isArray(roleClaim)) return roleClaim;
      if (typeof roleClaim === "string") return [roleClaim];

      return [];
    } catch (error) {
      console.error("Error decoding token:", error);
      return [];
    }
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem("token");
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Date.now() > payload.exp * 1000;
    } catch {
      return true;
    }
  }

  isTokenExpiredActual(): boolean {
    const expiry = this.storage?.getItem(Enums.values.expiry);
    if (!expiry) return true;

    const expiryTime = new Date(expiry).getTime();
    return Date.now() >= expiryTime;
  }

  isTokenExpiredWithNumbers(bufferSeconds: number = 30): boolean {
    try {
      const expiry = this.storage?.getItem(Enums.values.expiry);
      if (!expiry) return true;

      const expiryTime = new Date(expiry).getTime();
      if (isNaN(expiryTime)) return true; // Invalid date

      const bufferMs = bufferSeconds * 1000;
      return Date.now() >= expiryTime - bufferMs;
    } catch (error) {
      console.error("Token expiry check failed:", error);
      return true; // Fail safe
    }
  }

  getTokenExpiryStatus(): { isExpired: boolean; secondsRemaining?: number } {
    const expiry = this.storage?.getItem(Enums.values.expiry);
    if (!expiry) return { isExpired: true };

    const expiryTime = new Date(expiry).getTime();
    const currentTime = Date.now();
    const secondsRemaining = Math.max(0, (expiryTime - currentTime) / 1000);

    return {
      isExpired: currentTime >= expiryTime - 30000, // 30s buffer
      secondsRemaining: secondsRemaining > 0 ? Math.round(secondsRemaining) : 0,
    };
  }

  isLoggedIn(): boolean {
    console.log("IsLogged", !!this.getToken());
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  RolesMatch(allowed: string[]): boolean {
    return allowed.length > 0 && this.hasAnyRole(allowed);
  }

  logOut(): void {
    this.clearSession();
    this.toastr.info("Logged out successfully.");
    this.router.navigate(["/login"]);
  }

  logoutV2(): void {
    this.clearSession();
    this.toastr.info("Too many request error. Please login again.");
    this.router.navigate(["/user-login"]);
  }

  sessionExpired(): void {
    this.clearSession();
    // this.toastr.info('Session is expired. Please login again.');
    //this.router.navigate(['/user-login'], { replaceUrl: true });

    Swal.fire({
      icon: "warning",
      title: "Session Expired",
      text: "",
      showConfirmButton: true,
      confirmButtonColor: "#1976d2",
      confirmButtonText: "Go to Login",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      this.router.navigate(["/user-login"], { replaceUrl: true });
    });

    // Move Swal to component if needed
  }

  private clearSession(): void {
    this.storage?.clear();
    this.session?.clear();
  }

  sessionExpired2(): void {
    this.clearSession();
    this.router.navigate(["/login"]);
  }
}
