import { createCookieSessionStorage, redirect } from "@remix-run/node";
import {
  TypedSession,
  createTypedSessionStorage,
} from "remix-utils/typed-session";
import { z } from "zod";
import { isProdEnvironment } from "./env.server";
import { User } from "~/models/user";
import { randomBytes } from "node:crypto";
import {
  Token,
  createToken,
  disableToken,
  getToken,
} from "~/models/auth-token";
import { SessionError } from "./error";

const userSessionCookieName = "auth_cookie";
const EMPTY_TOKEN = "NONE";
const schema = z.object({
  token: z.string().catch(EMPTY_TOKEN),
});

const authSessionStorage = createTypedSessionStorage({
  sessionStorage: createCookieSessionStorage({
    cookie: {
      name: userSessionCookieName,
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [process.env.AUTH_COOKIE_SECRET],
      secure: isProdEnvironment,
    },
  }),
  schema,
});

async function updateAuthCookie(
  authSession: TypedSession<typeof schema>,
  tokenValue: string,
  redirectTo = "/",
): Promise<never> | never {
  authSession.set("token", tokenValue);
  throw redirect(redirectTo, {
    headers: {
      "Set-Cookie": await authSessionStorage.commitSession(authSession),
    },
  });
}

export class AuthToken {
  private constructor(
    public readonly id: string,
    public readonly value: string,
    public readonly isAuthenticated: boolean = false,
    private authSession: TypedSession<typeof schema>,
  ) {}

  // 1. generate auth token and create entry in database
  // 2. relate token to `userId` if provided
  // 3. copy relations and permissions from `refresh`, if provided
  private static async create(
    authSession: TypedSession<typeof schema>,
    options?: { userId?: string; refresh?: Token },
  ): Promise<AuthToken> {
    const tokenValue = randomBytes(16).toString("hex");
    const token = await createToken({
      value: tokenValue,
      userId: options?.userId || options?.refresh?.user?.id,
    });
    // TODO: copy relations and permissions from `refresh`, if any

    return new AuthToken(token.id, token.value, !!token.user, authSession);
  }

  // 1. disable token in database
  // 2. revoke permissions, if any
  private static async invalidate({
    tokenValue,
  }: {
    tokenValue: string;
  }): Promise<boolean> {
    const newToken = await disableToken({ value: tokenValue });
    // TODO: disable relations and revoke permissions, if any
    return newToken?.active ? !newToken.active : false;
  }

  // 1. validate token value from cookie and device used against the database and construct auth token object
  // 2. token value should match an active auth token and device used must be enlisted under the devices the user used to logged in from
  // 3. validation failure possible reasons:
  //    🟢 token expired (criteria: not active)
  //    🟠 token guessing (criteria: token doesn't exist)
  //    🔴 token theft (criteria: device is not registered as a device the user logged in from)
  // 4. if token expired, refresh it (generate new token + copy properties from old one + invalidate old token)
  static async get(request: Request): Promise<AuthToken> {
    const cookie = request.headers.get("cookie");
    const authSession = await authSessionStorage.getSession(cookie);
    const tokenValue = authSession.get("token");
    // TODO: extract user-agent for logging and fraud detection
    if (!tokenValue || tokenValue === EMPTY_TOKEN) {
      const token = await AuthToken.create(authSession);
      await updateAuthCookie(authSession, token.value, request.url);
    }

    // @ts-expect-error - the call to `updateAuthCookie` should throw a redirect so at this point, `tokenValue` should not be null
    const token = await getToken({ value: tokenValue });
    if (!token) {
      console.warn(
        `🟠 Suspected token guessing: token from cookie not found in database. Token value: ${tokenValue}`,
      );
      const token = await AuthToken.create(authSession);
      await updateAuthCookie(authSession, token.value, request.url);
      throw new Error("Should NOT throw"); // `updateAuthCookie` throws a redirect, so this line should NOT run and it's for TS only (try to comment this out and see TS angry ;))
    }

    // TODO: handle token theft (i.e., device not registered). Depends on previous TODO (extract user-agent)

    if (!token.active) {
      console.info(`🔵 Token expired: ${token.value}`);
      const newToken = await AuthToken.create(authSession, { refresh: token });
      if (!(await AuthToken.invalidate({ tokenValue: token.value }))) {
        console.warn(
          `🟠 Failed to invalidate expired token. Token value: ${token.value}`,
        );
      }
      await updateAuthCookie(authSession, newToken.value, request.url);
    }

    return new AuthToken(token.id, token.value, !!token.user, authSession);
  }

  // 1. check if token still active
  // 2. fetch related user from the database
  async getUser(): Promise<User> | Throws {
    const token = await getToken({ value: this.value });
    if (!token || !token.active) {
      console.warn(
        `🟠 Access to token's user blocked: token inactive. Token: ${this.value}`,
      );
      throw new SessionError("User unauthenticated");
    }
    if (!token.user) {
      console.warn(
        `🟠 Access to token's user blocked: token unauthenticated. Token: ${this.value}`,
      );
      throw new SessionError("User unauthenticated");
    }

    return token.user;
  }

  // 1. check if token still active
  // 2. invalidate token in database
  // 3. create new auth token and associate it with the provided `userId`
  // 4. set/return cookie(s)
  upgrade(options: {
    userId: string;
    headers?: Headers;
    redirectTo?: string;
  }): Promise<never | Throws>;
  upgrade(options: {
    userId: string;
    headers?: Headers;
    redirectTo: false;
  }): Promise<{ token: AuthToken; headers: Headers } | Throws>;
  async upgrade(options: {
    userId: string;
    headers?: Headers;
    redirectTo?: string | false;
  }) {
    const token = await getToken({ value: this.value });
    if (!token) {
      console.warn(
        `🟠 Suspected token guessing: token from cookie not found in database. Token value: ${this.value}`,
      );
      await AuthToken.invalidate({ tokenValue: this.value });
      await updateAuthCookie(this.authSession, EMPTY_TOKEN, "/signin");
      throw new Error("Should NOT throw"); // see comment above in `get` method
    }

    if (!token.active) {
      // token expired. redirect to /signin to re-login
      await updateAuthCookie(this.authSession, EMPTY_TOKEN, "/signin");
    }

    const newToken = await AuthToken.create(this.authSession, {
      userId: options.userId,
    });
    await AuthToken.invalidate({ tokenValue: this.value });
    this.authSession.set("token", newToken.value);
    if (options.redirectTo === false) {
      return {
        token: newToken,
        headers: new Headers({
          "Set-Cookie": await authSessionStorage.commitSession(
            this.authSession,
          ),
        }),
      };
    } else {
      throw redirect(options.redirectTo || "/", {
        headers: [
          ...(options.headers?.entries() || []),
          [
            "Set-Cookie",
            await authSessionStorage.commitSession(this.authSession),
          ],
        ],
      });
    }
  }

  // 1. check if token still active
  // 2. invalidate token in database
  // 3. create new anonymous/guest auth token
  // 4. set/return cookie(s)
  downgrade(options?: { redirectTo?: string }): Promise<never | Throws>;
  downgrade(options?: {
    redirectTo: false;
  }): Promise<{ token: AuthToken; headers: Headers } | Throws>;
  async downgrade(options?: { redirectTo?: string | false }) {
    const token = await getToken({ value: this.value });
    if (!token) {
      console.warn(
        `🟠 Suspected token guessing: token from cookie not found in database. Token value: ${this.value}`,
      );
      await AuthToken.invalidate({ tokenValue: this.value });
      await updateAuthCookie(this.authSession, EMPTY_TOKEN, "/signin");
      throw new Error("Should NOT throw"); // see comment above in `get` method
    }

    if (!token.active) {
      // token expired. redirect to /signin to re-login
      await updateAuthCookie(this.authSession, EMPTY_TOKEN, "/signin");
    }

    const newToken = await AuthToken.create(this.authSession);
    await AuthToken.invalidate({ tokenValue: this.value });
    this.authSession.set("token", newToken.value);
    if (options?.redirectTo === false) {
      return {
        token: newToken,
        headers: new Headers({
          "Set-Cookie": await authSessionStorage.commitSession(
            this.authSession,
          ),
        }),
      };
    } else {
      throw redirect(options?.redirectTo || "/", {
        headers: {
          "Set-Cookie": await authSessionStorage.commitSession(
            this.authSession,
          ),
        },
      });
    }
  }
}
