import {
  AccessRequest,
  type AccessResponse,
  checkAccess,
} from "./access-control";
import type { Fields, AuthrSubject, AuthrModel } from "./types";

interface ObjectMatcher<M extends AuthrSubject = AuthrSubject> {
  <T extends AuthrSubject = M>(obj: T): Promise<AccessResponse>;
  <T extends AuthrSubject = M>(
    obj: AuthrModel,
  ): { with: (data: Partial<T>) => Promise<AccessResponse> };
}

export const can = (sub: AuthrSubject) => {
  return {
    read: readMatcher(sub),
    update: updateMatcher(sub),
    change: updateMatcher(sub),
    create: createMatcher(sub),
    remove: removeMatcher(sub),
  };
};

const readMatcher = (sub: AuthrSubject) => {
  const request = new AccessRequest("READ").setSubject(sub);

  return <T extends AuthrSubject>(fields: Fields<T>) => {
    request.setFields(fields);

    return {
      of: (obj => {
        if (typeof obj === "string") {
          return {
            with(data) {
              request.setObject({ model: obj, details: data });

              return checkAccess(request);
            },
          };
        } else {
          request.setObject(obj);

          return checkAccess(request);
        }
      }) as ObjectMatcher<T>,
    };
  };
};
const updateMatcher = (sub: AuthrSubject) => {
  const request = new AccessRequest("UPDATE").setSubject(sub);

  return <T extends AuthrSubject>(fields: Fields<T>) => {
    request.setFields(fields);

    return {
      of: (obj => {
        if (typeof obj === "string") {
          return {
            with(data) {
              request.setObject({ model: obj, details: data });

              return checkAccess(request);
            },
          };
        } else {
          request.setObject(obj);

          return checkAccess(request);
        }
      }) as ObjectMatcher<T>,
    };
  };
};
const createMatcher = (sub: AuthrSubject) => {
  const request = new AccessRequest("CREATE").setSubject(sub);

  return <T extends AuthrSubject>(model: AuthrModel) => {
    return {
      then(onfulfilled, onrejected) {
        request.setObject({ model });
        return checkAccess(request).then(onfulfilled).catch(onrejected);
      },
      catch(onrejected) {
        request.setObject({ model });
        return checkAccess(request).catch(onrejected);
      },
      with(data) {
        request.setObject({ model, details: data });
        return checkAccess(request);
      },
    } as Promise<AccessResponse> & {
      with: (data: Partial<T>) => Promise<AccessResponse>;
    };
  };
};

const removeMatcher = (sub: AuthrSubject) => {
  const request = new AccessRequest("DELETE").setSubject(sub);

  return (<T extends AuthrSubject>(obj: T | AuthrModel) => {
    if (typeof obj === "string") {
      return {
        with(data: Partial<T>) {
          request.setObject({ model: obj, details: data });

          return checkAccess(request);
        },
      };
    } else {
      request.setObject(obj);

      return checkAccess(request);
    }
  }) as ObjectMatcher;
};
