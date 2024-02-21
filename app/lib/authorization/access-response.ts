export class AccessResponse {
  constructor(protected readonly answer: "permitted" | "denied") {}

  get isAllowed() {
    return this.answer === "permitted";
  }
}

export class PermitResponse extends AccessResponse {
  constructor() {
    super("permitted");
  }
}

export class DenyResponse extends AccessResponse {
  constructor() {
    super("denied");
  }
}
