import { hasPermissionTo } from "../privileges";
import type { CombinedObjectParams, Entity, Models } from "../types";
import { AccessResponse } from "../access-response";

export function update(subject: Entity) {
  return <E extends keyof Models>(
    entityName: E,
    fields?: Array<keyof Models[E]>,
  ) => {
    return {
      async with(
        params: CombinedObjectParams<E, "update">,
      ): Promise<AccessResponse> {
        const permissionResponse = await hasPermissionTo("update", entityName, {
          ...params,
          fields,
          subject,
        });

        return permissionResponse;
      },
    };
  };
}
