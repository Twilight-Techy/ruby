import { betterAuth } from "better-auth";
import { neonAuth } from "@better-auth/neon";
import { db } from "./db";

export const auth = betterAuth({
    database: neonAuth({
        url: process.env.DATABASE_URL!,
    }),
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }
    }
});
