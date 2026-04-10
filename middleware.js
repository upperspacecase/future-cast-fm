// Middleware — no auth checks here, Firebase Auth handles it client-side
// and via token verification in API routes
export function middleware() {
  // pass through
}

export const config = {
  matcher: [],
};
