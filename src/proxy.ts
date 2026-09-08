import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: Parameters<typeof intlMiddleware>[0]) {
  // Admin paneli dil sisteminin dışında — kendi TR arayüzü var.
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return;
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
