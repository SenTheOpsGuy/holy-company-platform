import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/home(.*)',
  '/admin(.*)',
  '/profile(.*)',
  '/puja(.*)',
  '/games(.*)',
  '/content(.*)',
]);

// This middleware protects all routes and allows public access to specific routes
export default clerkMiddleware((auth, req) => {
  // Allow public routes to pass through without protection
  if (isPublicRoute(req)) return;
  
  // Protect all other routes
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
