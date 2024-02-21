import { hasPermission } from "../privileges";
import type { CombinedObjectParams, Entity, Models } from "../types";
import { AccessResponse } from "../access-response";

export function read(subject: Entity) {
  return <E extends keyof Models>(
    entityName: E,
    fields?: Array<keyof Models[E]>,
  ) => {
    return {
      async with(
        params: CombinedObjectParams<E, "read">,
      ): Promise<AccessResponse> {
        const permissionResponse = hasPermission("read", entityName, {
          ...params,
          fields,
          subject,
        });

        return permissionResponse;
      },
    };
  };
}
