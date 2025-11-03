export class Enums {
  static readonly token = 'accessToken';
  static readonly roles = 'userRoles';
  static readonly expiry = 'requestDate';

  static readonly values = Object.freeze({
    token: Enums.token,
    roles: Enums.roles,
    expiry: Enums.expiry
  });
}