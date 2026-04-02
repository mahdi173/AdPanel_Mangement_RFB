export class Group {
  constructor(
    public readonly id: string | null,
    public readonly name: string,
    public users: { id: string; email: string }[] = [],
  ) {}
}
