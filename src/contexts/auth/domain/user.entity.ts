export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public permissions: string = '00001',
  ) {}

  updatePermissions(newPermissions: string) {
    this.permissions = newPermissions;
  }
}
