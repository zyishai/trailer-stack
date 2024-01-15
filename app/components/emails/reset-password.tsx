import {
  Html,
  Preview,
  Text,
  Link,
  Section,
  Container,
  Img,
  Head,
  Body,
} from "@react-email/components";

type TemplateProps = {
  verificationLink: string;
  contactLink: string;
};
export default function ResetPasswordTemplate({
  verificationLink,
  contactLink,
}: TemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>🎞️ Follow this steps to reset your password</Preview>
      <Body
        style={{
          backgroundColor: "#fafafa",
          paddingBlock: 30,
        }}
      >
        <Img
          src="/assets/logo-wide.svg"
          style={{
            margin: "0 auto",
            marginBottom: 20,
            height: 56,
          }}
        />
        <Container
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: 5,
            // boxShadow: "0 5px 10px rgba(20, 50, 70, .2)",
            maxWidth: 560,
            width: "auto",
            margin: "0 auto",
            padding: "20px 25px",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "sans-serif",
              fontWeight: 700,
              letterSpacing: 0,
              lineHeight: "16px",
              margin: "16px 8px 8px 8px",
            }}
          >
            Follow the following steps to reset your password
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "sans-serif",
              fontWeight: 400,
              letterSpacing: 0,
              lineHeight: "18px",
              margin: "16px 8px 8px 8px",
            }}
          >
            We are sending you this message because you asked to reset your
            password. If it wasn't you, you can safely ignore this message.
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "sans-serif",
              fontWeight: 400,
              letterSpacing: 0,
              lineHeight: "18px",
              margin: "16px 8px 8px 8px",
            }}
          >
            If you requested to reset your email, click on the following link to
            reset your current password:
          </Text>
          <Link
            href={verificationLink}
            rel="noreferrer"
            style={{
              fontSize: 12,
              fontFamily: "sans-serif",
              fontWeight: 400,
              letterSpacing: 0,
              lineHeight: "18px",
              margin: "16px 8px 8px 8px",
            }}
          >
            Reset your password
          </Link>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "sans-serif",
              fontWeight: 400,
              letterSpacing: 0,
              lineHeight: "18px",
              margin: "16px 8px 8px 8px",
            }}
          >
            For further questions and help, contact us at{" "}
            <Link href={contactLink}>contact@trailer.com</Link>
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "sans-serif",
              fontWeight: 400,
              letterSpacing: 0,
              lineHeight: "18px",
              margin: "16px 8px 8px 8px",
            }}
          >
            Sincerely, <br />
            🎞️ The Trailer Team
          </Text>
        </Container>
        <Section style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "sans-serif",
              fontWeight: 500,
              letterSpacing: 0,
              lineHeight: "18px",
              margin: "16px 8px 8px 8px",
              textAlign: "center",
              color: "#777",
            }}
          >
            Powered by <Link href="http://localhost:3000/">Trailer Stack</Link>
          </Text>
        </Section>
      </Body>
    </Html>
  );
}

ResetPasswordTemplate.PreviewProps = {
  verificationLink: "http://localhost:3000/",
  contactLink: "mailto:contact@trailer.com",
};
