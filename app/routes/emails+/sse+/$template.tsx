import { type LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import watch from "node-watch";
import { normalize } from "node:path";
import { unlinkSync, existsSync } from "node:fs";
import { compileTemplate, getTemplatesDir } from "./_helpers";
import { renderTemplate } from "~/lib/email.server";
import { devOnlyEnabled } from "~/lib/misc";

export async function loader({ request, params }: LoaderFunctionArgs) {
  devOnlyEnabled();

  const { template = "" } = params;
  const templatesDir = getTemplatesDir();
  const templatePath = normalize(`${templatesDir}/${template}.tsx`);
  if (!existsSync(templatePath)) {
    return null;
  }

  return eventStream(request.signal, send => {
    type SendFunction = typeof send;

    let taskId: number | NodeJS.Timeout | null = null;

    function queueEvent(
      send: SendFunction,
      type?: string,
      templatePath?: string,
    ) {
      compileTemplate({
        templateName: template,
        write: true,
      })
        .then(async res => {
          const { out, buildId } = res;

          try {
            const mod = await import(out);
            const component = mod?.default?.default;
            const { html } = await renderTemplate(
              component(component.PreviewProps || {}),
            );
            send({
              data: JSON.stringify({
                id: buildId,
                html,
              }),
            });
          } catch (error: any) {
            console.error(
              `🚨 Failed importing module: ${out}: ${error.message}`,
            );
          } finally {
            unlinkSync(out);
          }
        })
        .catch(error => {
          console.log(
            `🚨 Compilation of email template "${template}" failed: ${error.message}`,
          );
        });
    }

    const watcher = watch(templatePath).on("change", (type, filename) => {
      if (taskId) {
        clearTimeout(taskId);
        taskId = null;
      }

      taskId = setTimeout(() => {
        queueEvent(send);
      }, 100);
    });

    queueEvent(send);

    return () => {
      watcher.close();
    };
  });
}
