import { parse } from "@conform-to/zod";
import { WebAuthnStrategy } from "remix-auth-webauthn";
import { getDatabaseInstance } from "~/lib/db.server";
import { getDomain } from "~/lib/misc";
import {
  Authenticator,
  getAuthenticatorById,
  getUserAuthenticators,
} from "~/models/authenticator";
import {
  User,
  type UserResponse,
  getUserById,
  getUserByUsername,
} from "~/models/user";

export default new WebAuthnStrategy<User>(
  {
    rpName: "Remix Trailer Stack",
    rpID: request => {
      const domain = getDomain(request);
      return new URL(domain).hostname;
    },
    origin: request => {
      const domain = getDomain(request);
      return new URL(domain).origin;
    },
    getUserAuthenticators: async user => {
      if (!user) return [];

      const db = await getDatabaseInstance();
      const responses = await db.query<Authenticator>(getUserAuthenticators, {
        userId: user.id,
      });

      return responses.filter(authr => Authenticator.safeParse(authr).success);
    },
    getUserDetails: async user => {
      return user;
    },
    getUserByUsername: async username => {
      const db = await getDatabaseInstance();
      const responses = await db.query<UserResponse>(getUserByUsername, {
        username,
      });
      const submission = parse(new URLSearchParams(responses[0] ?? undefined), {
        schema: User,
      });
      if (!submission.value) {
        throw submission;
      }

      return submission.value;
    },
    getAuthenticatorById: async id => {
      const db = await getDatabaseInstance();
      const responses = await db.query<Authenticator>(getAuthenticatorById, {
        id,
      });
      const authr = Authenticator.safeParse(responses[0]);
      if (!authr.success) {
        return null;
      }

      return {
        ...authr.data,
        credentialBackedUp: Number(authr.data.credentialBackedUp),
        transports: authr.data.transports.join(","),
      };
    },
  },
  async function verify({ username, authenticator, type }) {
    const db = await getDatabaseInstance();

    if (type === "registration") {
      throw new Error("Not implemented");
      /* NOTE: The code below is *NOT SAFE* and is kept here just for future reference!!!
       * Basically, in the following code we associate *any device* with *any user*
       * as long as that user exists in our database - this is a SECURITY ISSUE!
       * We need to modify this in one of the following ways:
       * 1. Create a new user with the registered device.
       *   Problems:
       *   - Email is missing and the API of verify passing *just* the username (possible solution: send a PR to pass the formData, or fork the project)
       *   - I want the user to register with a password so it'll have backup for when the device is not with him (e.g., on commuting)
       *
       * 2. Associate the device with an existing user.
       *   Problems:
       *   - How I'm ensuring the username provided is the real user and not an imposter? (need some kind of user/pass combination to verify that the sender is the account owner).
       *   - I need more information to be passed to the `verify` method.
       */

      // const [userResult] = await db.query<UserResponse>(getUserByUsername, { username });
      // const userSubmission = parse(new URLSearchParams(userResult), { schema: User });
      // if (!userSubmission.value) {
      //   throw userSubmission;
      // }

      // const user = userSubmission.value;
      // const [authr] = await db.query<Authenticator>(registerDevice, {
      //   credentialID: authenticator.credentialID,
      //   userId: user.id,
      //   credentialPublicKey: authenticator.credentialPublicKey,
      //   counter: authenticator.counter,
      //   credentialDeviceType: authenticator.credentialDeviceType,
      //   credentialBackedUp: Boolean(authenticator.credentialBackedUp),
      //   transports: authenticator.transports.split(',').map(token => token.trim())
      // });
      // const authrSubmission = Authenticator.safeParse(authr);
      // if (!authrSubmission.success) {
      //   console.warn(`⚠️ Failed to register device.\n\n\t📱 Device Info: ${JSON.stringify(authenticator, null, 2)}\n\n\t‼️ Error Message: ${authrSubmission.error}`);
      //   throw new Error('Failed to register device');
      // }
      // return user;
    } else if (type === "authentication") {
      const responses = await db.query<Authenticator>(getAuthenticatorById, {
        id: authenticator.credentialID,
      });
      const authr = Authenticator.safeParse(responses[0]);
      if (!authr.success) {
        throw new Error("Authentication failed");
      }
      const { userId } = authr.data;
      const [userResult] = await db.query<UserResponse>(getUserById, {
        id: userId,
      });
      const userSubmission = parse(new URLSearchParams(userResult), {
        schema: User,
      });
      if (!userSubmission.value) {
        throw userSubmission;
      }

      return userSubmission.value;
    }

    // This line should never execute, since 'remix-auth-webauthn' ensures that the value of `type`
    // is either "registration" or "authentication", but we need this to make Typescript happy ;)
    throw new Error("Invalid authentication flow");
  },
);
