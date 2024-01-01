import { Form } from "@remix-run/react";
import { Button, ButtonProps } from "./ui/button";
import { PropsWithChildren } from "react";

interface LogoutProps extends ButtonProps {
  value?: string;
}
export function LogoutButton({
  value = "Logout",
  children,
  ...props
}: PropsWithChildren<LogoutProps>) {
  return (
    <Form method="post" action="/logout">
      <Button {...props}>{children || value}</Button>
    </Form>
  );
}
