import { auth } from '@/lib/auth';

export const proxy = auth.middleware({
    loginUrl: '/login'
});

export const config = {
    matcher: [
        // Match all paths except static files and auth API
        "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
    ],
};
