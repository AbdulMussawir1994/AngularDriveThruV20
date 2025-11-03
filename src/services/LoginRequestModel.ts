export interface LoginRequestModel {
    userName: string;
    password: string;
  }


  export interface LoginResponseModel {
    token: string;
  }

  export interface Role {
  roleName: string;
}
