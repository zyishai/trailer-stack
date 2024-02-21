import { hasPermission } from "../privileges";
import type { CombinedObjectParams, Entity, Models } from "../types";
import { AccessResponse } from "../access-response";

export function create(subject: Entity) {
  return <E extends keyof Models>(entityName: E) => {
    return {
      async with(
        params: CombinedObjectParams<E, "create">,
      ): Promise<AccessResponse> {
        const permissionResponse = await hasPermission("create", entityName, {
          ...params,
          subject,
        });

        return permissionResponse;
      },
    };
  };
}
