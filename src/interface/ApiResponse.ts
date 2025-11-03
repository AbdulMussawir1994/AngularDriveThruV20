export interface ApiResponse<T> {
  message: string;
  status: boolean;
  data: T;
  code: string;
}


// export interface ApiResponse<T> {
//   logId: string;
//   status: ApiStatus;
//   content: T;
//   requestDateTime: string;
// }

// export interface ApiStatus {
//   isSuccess: boolean;
//   code: string;
//   statusType: number;
//   statusMessage: string;
// }