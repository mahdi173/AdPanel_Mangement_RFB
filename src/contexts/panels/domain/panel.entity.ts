export class Panel {
  constructor(
    public readonly id: string | null,
    public readonly name: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public status: 'PENDING' | 'APPROVED' = 'PENDING',
  ) {}
}
