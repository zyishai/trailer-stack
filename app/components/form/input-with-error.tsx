import { AlertCircleIcon } from "lucide-react";
import { Label } from "../ui/label";
import { Input, InputProps } from "../ui/input";
import { cn } from "~/lib/misc";

type Props = {
  className?: string;
  label?: string;
  error?: string;
  errorId?: string;
} & InputProps;
export function InputWithError({
  className,
  label,
  error,
  errorId,
  ...inputProps
}: Props) {
  return (
    <div className={cn("grid gap-1", className)}>
      {label ? <Label htmlFor={inputProps.id}>{label}</Label> : null}
      <Input {...inputProps} />
      {error ? (
        <div className="flex items-center gap-1">
          <AlertCircleIcon
            size={12}
            strokeWidth={2.5}
            aria-hidden="true"
            className="text-red-500"
          />
          <span id={errorId} className="text-xs text-red-500">
            {error}
          </span>
        </div>
      ) : null}
    </div>
  );
}
