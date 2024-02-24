import { hasPermissionTo } from "../privileges";
import type { CombinedObjectParams, Entity, Models } from "../types";
import { AccessResponse } from "../access-response";

export function remove(subject: Entity) {
  return <E extends keyof Models>(entityName: E) => {
    return {
      async with(
        params: CombinedObjectParams<E, "delete">,
      ): Promise<AccessResponse> {
        const permissionResponse = await hasPermissionTo("delete", entityName, {
          ...params,
          subject,
        });

        return permissionResponse;
      },
    };
  };
}
