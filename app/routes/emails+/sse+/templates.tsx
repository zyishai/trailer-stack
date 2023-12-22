import { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import watch from "node-watch";
import { getTemplatesDir, getTemplatesNames } from "~/lib/email.server";
import { devOnlyEnabled } from "~/lib/misc";

export async function loader({ request }: LoaderFunctionArgs) {
  devOnlyEnabled();

  return eventStream(request.signal, send => {
    type SendFunction = typeof send;

    let taskId: number | NodeJS.Timeout | null = null;

    function queueEvent(
      send: SendFunction,
      type?: string,
      templatePath?: string,
    ) {
      getTemplatesNames()
        .then(templates => {
          send({
            data: JSON.stringify({
              id: getBuildId(),
              templates,
            }),
          });
        })
        .catch(error => {
          console.error(`🚨 Failed to fetch templates: ${error.message}`);
        });
    }

    const templatesDir = getTemplatesDir();
    const watcher = watch(templatesDir).on("change", (type, filename) => {
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

function getBuildId() {
  // naive way to get fresh id for each build
  return Date.now();
}
