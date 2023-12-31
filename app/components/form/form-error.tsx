import { AlertTriangleIcon } from "lucide-react";
import { cn } from "~/lib/misc";

type Props = {
  error?: string;
  className?: string;
};
export function FormError({ error, className }: Props) {
  return error ? (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <AlertTriangleIcon
        size={13}
        strokeWidth={2.5}
        aria-hidden="true"
        className="text-red-500"
      />
      <span className="text-sm text-red-500">{error}</span>
    </div>
  ) : null;
}
