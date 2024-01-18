import {
  type Session,
  type SessionData,
  createCookieSessionStorage,
} from "@remix-run/node";
import {
  TypedSession,
  createTypedSessionStorage,
} from "remix-utils/typed-session";
import { z } from "zod";
import { authenticatorSessionKeys } from "./auth.server";
import { User } from "~/models/user";
import { EmailAddress } from "~/models/email";

const cookieName = "AS_info_session";

const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: cookieName,
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.AUTH_COOKIE_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const schema = z.object({
  user: User.or(z.null()).optional(),
  "auth:error": z.object({ message: z.string() }).optional(),
  otp: z.string().optional(),
  email: EmailAddress.optional(),
  challenge: z.any(),
});
const typedAuthSessionStorage = createTypedSessionStorage({
  sessionStorage: authSessionStorage,
  schema,
});

function clearSessionKeys<Schema extends z.ZodTypeAny = z.AnyZodObject>(
  session: Session | TypedSession<Schema>,
) {
  for (const key of Object.keys(session.data)) {
    session.unset(key);
  }
}

function getAuthSession<Typed extends boolean = true>(
  request: Request,
  options?: { typed: Typed },
): Promise<
  Typed extends true
    ? {
        session: TypedSession<typeof schema>;
        commit: () => Promise<string>;
        destroty: () => Promise<string>;
        clear: () => void;
      }
    : {
        session: Session<SessionData, SessionData>;
        commit: () => Promise<string>;
        destroty: () => Promise<string>;
        clear: () => void;
      }
>;
async function getAuthSession(
  request: Request,
  options = { typed: true },
): Promise<
  | {
      session: TypedSession<typeof schema>;
      commit: () => Promise<string>;
      destroty: () => Promise<string>;
      clear: () => void;
    }
  | {
      session: Session<SessionData, SessionData>;
      commit: () => Promise<string>;
      destroty: () => Promise<string>;
      clear: () => void;
    }
> {
  if (options.typed) {
    const session = await typedAuthSessionStorage.getSession(
      request.headers.get("cookie"),
    );
    return {
      session,
      commit: () => typedAuthSessionStorage.commitSession(session),
      destroy: () => typedAuthSessionStorage.destroySession(session),
      clear: () => clearSessionKeys(session),
    } as any;
  } else {
    const session = await authSessionStorage.getSession(
      request.headers.get("cookie"),
    );
    return {
      session,
      commit: () => authSessionStorage.commitSession(session),
      destroy: () => authSessionStorage.destroySession(session),
      clear: () => clearSessionKeys(session),
    } as any;
  }
}

export { authSessionStorage, typedAuthSessionStorage };
export { authenticatorSessionKeys, clearSessionKeys, getAuthSession };
