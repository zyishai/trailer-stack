import { useEffect, useMemo, useState } from "react";

type ISODateTime = string;
export const useCountdown = ({
  expirationTime,
}: {
  expirationTime?: ISODateTime;
}) => {
  const [diff, setDiff] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (expirationTime) {
      interval = setInterval(() => {
        const diffInSeconds = Math.max(
          0,
          Math.floor((+new Date(expirationTime) - +new Date()) / 1000),
        );
        const hours = Math.floor(diffInSeconds / 60 / 60);
        const minutes = Math.floor((diffInSeconds / 60) % 60);
        const seconds = diffInSeconds % 60;
        setDiff({ hours, minutes, seconds });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [expirationTime]);

  return useMemo(
    () => ({
      hours: diff.hours,
      minutes: diff.minutes,
      seconds: diff.seconds,
      prettyPrint: (options?: {
        noHours?: boolean;
        noMinutes?: boolean;
        noSeconds?: boolean;
      }) => {
        const { noHours, noMinutes, noSeconds } = options || {};
        const prettyHours = diff.hours.toString().padStart(2, "0");
        const prettyMinutes = diff.minutes.toString().padStart(2, "0");
        const prettySeconds = diff.seconds.toString().padStart(2, "0");

        return [
          noHours ? null : prettyHours,
          noMinutes ? null : prettyMinutes,
          noSeconds ? null : prettySeconds,
        ]
          .filter(Boolean)
          .join(":");
      },
    }),
    [diff],
  );
};
