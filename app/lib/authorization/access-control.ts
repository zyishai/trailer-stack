import {
  type CanDeleteGrant,
  type CanReadGrant,
  type CanUpdateGrant,
  getMaybeDeleteGrant,
  getMaybeReadGrant,
  getMaybeUpdateGrant,
} from "~/models/grant";
import type {
  AccessType,
  Fields,
  AuthrSubject,
  AuthrObject,
  AuthrModel,
} from "./types";
import { type Constraint, Constraints } from "./constraints";
import invariant from "tiny-invariant";
import { Permissions } from "./permissions";

export class AccessRequest {
  private subject?: AuthrSubject;
  private object?: AuthrObject;
  private details: { fields?: Fields } = {};

  constructor(public readonly accessType: AccessType) {}

  setSubject(sub: AuthrSubject) {
    this.subject = { id: sub.id };
    return this;
  }

  setObject(obj: AuthrObject) {
    this.object = obj;
    return this;
  }

  setFields(fields: Fields) {
    this.details.fields = fields;
    return this;
  }

  getData() {
    invariant(this.subject, "Cannot get request subject: empty");
    invariant(this.object, "Cannot get request object: empty");

    return {
      subject: this.subject,
      details: this.details,
      object: this.object,
    };
  }
}

export class AccessResponse {
  constructor(public readonly answer: "permitted" | "denied") {}
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

export async function checkAccess(
  request: AccessRequest,
): Promise<AccessResponse> {
  if (request.accessType === "READ") {
    const requestData = request.getData();
    const { subject, object, details } = requestData;
    let grant: Maybe<CanReadGrant>;

    if (
      !("id" in object) ||
      !(grant = await getMaybeReadGrant(subject, object, details.fields))
    ) {
      const model =
        "id" in object ? (object.id.split(":")[0] as AuthrModel) : object.model;
      const details = "id" in object ? undefined : object.details;

      if (
        await checkPermission({
          subject,
          accessType: request.accessType,
          model,
          details,
        })
      ) {
        return new PermitResponse();
      } else {
        return new DenyResponse();
      }
    } else {
      if (
        grant.constraints.every(constraint => {
          if (!Object.keys(Constraints).includes(constraint)) {
            console.warn(
              `🟠 Invalid constraint ${constraint} found for request: ${JSON.stringify(
                request,
                null,
                2,
              )}`,
            );
            return true;
          } else {
            return Constraints[constraint as Constraint].check({
              subject,
              object,
              details,
            });
          }
        })
      ) {
        return new PermitResponse();
      }
    }

    return new DenyResponse();
  } else if (request.accessType === "UPDATE") {
    const requestData = request.getData();
    const { subject, object, details } = requestData;
    let grant: Maybe<CanUpdateGrant>;
    if (
      !("id" in object) ||
      !(grant = await getMaybeUpdateGrant(subject, object, details.fields))
    ) {
      const model =
        "id" in object ? (object.id.split(":")[0] as AuthrModel) : object.model;
      const details = "id" in object ? undefined : object.details;

      if (
        await checkPermission({
          subject,
          accessType: request.accessType,
          model,
          details,
        })
      ) {
        return new PermitResponse();
      } else {
        return new DenyResponse();
      }
    } else {
      if (
        grant.constraints.every(constraint => {
          if (!Object.keys(Constraints).includes(constraint)) {
            console.warn(
              `🟠 Invalid constraint ${constraint} for request: ${JSON.stringify(
                request,
                null,
                2,
              )}`,
            );
            return true;
          } else {
            return Constraints[constraint as Constraint].check({
              subject,
              object,
              details,
            });
          }
        })
      ) {
        return new PermitResponse();
      }
    }

    return new DenyResponse();
  } else if (request.accessType === "CREATE") {
    const { subject, object } = request.getData();
    if (
      await checkPermission({
        subject,
        accessType: request.accessType,
        model: object.model,
        details: object.details,
      })
    ) {
      return new PermitResponse();
    } else {
      return new DenyResponse();
    }
  } else if (request.accessType === "DELETE") {
    const requestData = request.getData();
    const { subject, object } = requestData;
    let grant: Maybe<CanDeleteGrant>;
    if (
      !("id" in object) ||
      !(grant = await getMaybeDeleteGrant(subject, object))
    ) {
      const model =
        "id" in object ? (object.id.split(":")[0] as AuthrModel) : object.model;
      const details = "id" in object ? undefined : object.details;

      if (
        await checkPermission({
          subject,
          accessType: request.accessType,
          model,
          details,
        })
      ) {
        return new PermitResponse();
      } else {
        return new DenyResponse();
      }
    } else {
      if (
        grant.constraints.every(constraint => {
          if (!Object.keys(Constraints).includes(constraint)) {
            console.warn(
              `🟠 Invalid constraint ${constraint} for request: ${JSON.stringify(
                request,
                null,
                2,
              )}`,
            );
            return true;
          } else {
            return Constraints[constraint as Constraint].check({
              subject,
              object,
            });
          }
        })
      ) {
        return new PermitResponse();
      }
    }

    return new DenyResponse();
  }

  return new DenyResponse();
}

async function checkPermission({
  subject,
  accessType,
  model,
  details,
}: {
  subject: AuthrSubject;
  accessType: AccessType;
  model: AuthrModel;
  details?: Record<string, any>;
}): Promise<boolean> {
  switch (accessType) {
    case "READ": {
      switch (model) {
        case "user": {
          const permission = Permissions["READ_USER"];
          const userId =
            typeof details?.userId === "string" ? details.userId : undefined;
          return await permission.check({ subject, details: { userId } });
        }
        case "credential": {
          return false;
        }
        case "auth_token": {
          return false;
        }
        case "totp": {
          return false;
        }
      }
    }
    case "UPDATE": {
      switch (model) {
        case "user": {
          return false;
        }
        case "credential": {
          return false;
        }
        case "auth_token": {
          return false;
        }
        case "totp": {
          return false;
        }
      }
    }
    case "CREATE": {
      switch (model) {
        case "user": {
          return false;
        }
        case "credential": {
          return false;
        }
        case "auth_token": {
          return false;
        }
        case "totp": {
          return false;
        }
      }
    }
    case "DELETE": {
      switch (model) {
        case "user": {
          return false;
        }
        case "credential": {
          return false;
        }
        case "auth_token": {
          return false;
        }
        case "totp": {
          return false;
        }
      }
    }
    default: {
      return false;
    }
  }
}
