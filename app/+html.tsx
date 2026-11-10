import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// Root HTML for the web build. The apple-* tags let iPad/iPhone Safari
// install Lingo via "Share -> Add to Home Screen" and open it full screen.
export default function Root({ children }: PropsWithChildren) {
  const base = process.env.EXPO_BASE_URL ?? "";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Lingo" />
        <meta name="theme-color" content="#6c4ef5" />
        <link rel="apple-touch-icon" href={`${base}/apple-touch-icon.png`} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
