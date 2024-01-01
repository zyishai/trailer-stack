import {
  Html,
  Preview,
  Text,
  Link,
  Section,
  Heading,
  Container,
  Img,
  Head,
  Body,
} from "@react-email/components";

type TemplateProps = {
  verificationCode: string;
  magicLink?: string;
};
export default function TotpTemplate({
  verificationCode,
  magicLink,
}: TemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>🎞️ Complete your sign-in</Preview>
      <Body
        style={{
          backgroundColor: "#fff",
        }}
      >
        <Container
          style={{
            backgroundColor: "#fff",
            border: "1px solid #eee",
            borderRadius: 5,
            boxShadow: "0 5px 10px rgba(20, 50, 70, .2)",
            marginTop: 20,
            maxWidth: 360,
            margin: "0 auto",
            padding: "60px 70px 80px",
          }}
        >
          <Img
            src="/assets/logo-wide.svg"
            style={{
              margin: "0 auto",
            }}
          />
          <Text
            style={{
              fontSize: 14,
              fontFamily: "sans-serif",
              fontWeight: 700,
              height: 16,
              letterSpacing: 0,
              lineHeight: "16px",
              margin: "16px 8px 8px 8px",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Verify Your Identity
          </Text>
          <Heading
            style={{
              color: "#000",
              display: "inline-block",
              fontSize: 20,
              fontFamily: "sans-serif",
              fontWeight: 500,
              lineHeight: "28px",
              marginBottom: 0,
              marginTop: 0,
              textAlign: "center",
            }}
          >
            Enter the following code to activate your account:
          </Heading>
          <Section
            style={{
              background: "rgba(0, 0, 0, .05)",
              borderRadius: 4,
              margin: "16px auto 14px",
              verticalAlign: "middle",
              width: 280,
            }}
          >
            <Text
              style={{
                color: "#000",
                display: "inline-block",
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "6px",
                lineHeight: "40px",
                paddingBottom: 8,
                paddingTop: 8,
                margin: "0 auto",
                width: "100%",
                textAlign: "center",
              }}
            >
              {verificationCode}
            </Text>
          </Section>
          <Text
            style={{
              fontFamily: "sans-serif",
              fontSize: 16,
              lineHeight: 1.2,
              textAlign: "center",
            }}
          >
            Or click on <Link href={magicLink}>this link.</Link>
          </Text>
          <Text
            style={{
              color: "#444",
              fontSize: 15,
              letterSpacing: 0,
              lineHeight: "23px",
              padding: "0 40px",
              margin: 0,
              textAlign: "center",
            }}
          >
            Not expecting this email?
          </Text>
          <Text
            style={{
              color: "#444",
              fontSize: 15,
              letterSpacing: 0,
              lineHeight: "23px",
              padding: "0 40px",
              margin: 0,
              textAlign: "center",
            }}
          >
            Contact{" "}
            <Link
              href=""
              style={{
                color: "#444",
                textDecoration: "underline",
              }}
            >
              support@trailer.com
            </Link>{" "}
            if you did not request this code.
          </Text>
        </Container>
        <Text
          style={{
            color: "#000",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: "23px",
            margin: 0,
            marginTop: 20,
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Powered by Trailer Stack.
        </Text>
      </Body>
    </Html>
  );
}

TotpTemplate.PreviewProps = {
  verificationCode: "15T9PSG2",
  magicLink: "http://localhost:8000/",
};
