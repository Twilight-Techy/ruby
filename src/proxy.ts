import { auth } from '@/lib/auth';

export const proxy = auth.middleware({
    loginUrl: '/login'
});

export const config = {
    matcher: [
        // Match page routes only — exclude static files, auth API, and all other API routes
        "/((?!_next/static|_next/image|favicon.ico|icon.png|api/).*)",
    ],
};
