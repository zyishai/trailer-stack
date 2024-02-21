import { findPrivilege } from "~/models/privilege";
import { Entity, isKeyOf } from "./types";
import { constraintsMap } from "./constraints";
import {
  AccessResponse,
  DenyResponse,
  PermitResponse,
} from "./access-response";

type ParamsWithSubject<
  Params extends Record<string, any> = { [key: string]: any },
> = { subject: Entity } & Params;

export const defaultPrivileges = {
  read: {
    user: async ({ id }: ParamsWithSubject<{ id: string }>) => {
      return true;
    },
  },
  create: {
    totp: async () => true,
  },
  update: {},
  delete: {},
};

export async function hasPermission(
  type: "read" | "create" | "update" | "delete",
  entityName: string,
  params: ParamsWithSubject,
): Promise<AccessResponse> {
  let response = false; // Default permission. Change on your own risk!
  if (
    isKeyOf(defaultPrivileges[type], entityName) &&
    typeof defaultPrivileges[type][entityName] === "function"
  ) {
    response = await (defaultPrivileges[type][entityName] as CallableFunction)(
      params,
    );
  }

  if (!response && typeof params.id === "string" && type !== "create") {
    const { subject, id } = params;
    const fields = Array.isArray(params.fields) ? params.fields : undefined;

    const priv = await findPrivilege({
      type,
      forId: subject.id,
      toId: id,
      fields,
    });
    if (priv) {
      for (const constraint of priv.constraints) {
        if (!isKeyOf(constraintsMap, constraint)) {
          console.warn(
            `🟠 Invalid constraint key ${constraint} found in ${priv.id}`,
          );
          continue;
        }

        if (
          !(await constraintsMap[constraint]({
            subjectId: subject.id,
            objectId: id,
            fields,
          }))
        ) {
          return new DenyResponse();
        }
      }

      return new PermitResponse();
    }
  }

  return response ? new PermitResponse() : new DenyResponse();
}
