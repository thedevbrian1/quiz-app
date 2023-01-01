import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";
import styles from "./tailwind.css";

export function meta() {
  return { title: "Game of Thrones quiz" };
}
export function links() {
  return [
    { rel: "stylesheet", href: styles },
    // {rel:"stylesheet", href: psoneStyles}
  ];
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/98mprice/PSone.css@master/PSone.min.css"></link> */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        {/* <link href="https://fonts.googleapis.com/css2?family=Cardo:wght@400;700&display=swap" rel="stylesheet"></link> */}

        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap" rel="stylesheet" />

        <Meta />
        <Links />
      </head>
      <body className="overflow-x-hidden font-body">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
