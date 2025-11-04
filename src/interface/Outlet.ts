export interface Outlet {
  id?: number;
  name: string;
  address: string;
  status: string;
  delivery: string;
  pickup: string;
  dinein: string;
  phone?: string;
  timeZone?: string;
  openingTime?: Date | null;
  closingTime?: Date | null;
  goalSummary?: string;
  breakFastStart?: Date | null;
  breakFastEnd?: Date | null;
  lunchStart?: Date | null;
  lunchEnd?: Date | null;
  dinnerStart?: Date | null;
  dinnerEnd?: Date | null;
}

export class RegisterViewModel{
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}