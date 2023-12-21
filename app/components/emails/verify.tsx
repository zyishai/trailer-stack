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
  validationCode: string;
};
export default function DefaultEmailTemplate({
  validationCode,
}: TemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>🚀 This is a development template</Preview>
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
            width: 360,
            margin: "0 auto",
            padding: "60px 70px 80px",
          }}
        >
          <Img
            src="https://picsum.photos/300/130"
            style={{
              margin: "0 auto",
            }}
          />
          <Text
            style={{
              color: "#0a85ea",
              fontSize: 11,
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
              fontWeight: 500,
              lineHeight: "24px",
              marginBottom: 0,
              marginTop: 0,
              textAlign: "center",
            }}
          >
            Enter the following code to finish linking Trailer.
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
              {validationCode}
            </Text>
          </Section>
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
          Securely powered by Trailer.
        </Text>
      </Body>
    </Html>
  );
}

DefaultEmailTemplate.PreviewProps = {
  validationCode: "12F8",
};
