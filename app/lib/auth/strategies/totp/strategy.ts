import { createTotp, deleteTotp, getTotp, updateTotp } from "~/models/totp";
import { sendEmail } from "~/lib/email.server";
import TotpTemplate from "~/components/emails/totp";
import { getUserByEmailAddress } from "~/models/user";
import { AuthorizationError } from "remix-auth";
import { OTPStrategy } from "../../otp-strategy.server";

export default new OTPStrategy(
  {
    options: {
      magicLinkUrl: "/auth/totp/magic-link",
    },
    async getUserByEmail(email) {
      return getUserByEmailAddress(email);
    },
    async storeOTP(otp, payload) {
      return createTotp(otp, payload);
    },
    async getOTP(otp) {
      return getTotp(otp);
    },
    async deactivateOTP(totp) {
      await updateTotp(totp.id, { active: false });
      await deleteTotp(totp.id);
      return true;
    },
    async sendEmail(options) {
      const { to, otp, verificationLink } = options;
      return sendEmail({
        to,
        subject: "Verify your identity",
        email: TotpTemplate({
          verificationCode: otp,
          magicLink: verificationLink,
        }),
      });
    },
  },
  async function ({ otp, email }) {
    const user = await getUserByEmailAddress(email);
    if (!user) {
      throw new AuthorizationError("Invalid OTP code");
    }

    return user;
  },
);
