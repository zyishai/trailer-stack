import { useParams } from "@remix-run/react";
import { useEventSource } from "remix-utils/sse/react";
import { Previewer } from "./previewer";

export default function TemplateViewer() {
  const { template } = useParams();
  const rawEvent = useEventSource(`/emails/sse/${template}`);
  const html = getTemplateHtml(rawEvent);

  if (!html) {
    return (
      <div>
        <p className="text-red-400">Template is empty</p>
      </div>
    );
  }

  return <Previewer html={html} className="h-full" />;
}

function getTemplateHtml(event?: string | null) {
  if (!event) {
    return null;
  }

  const parsed = JSON.parse(event);
  return parsed.html;
}
