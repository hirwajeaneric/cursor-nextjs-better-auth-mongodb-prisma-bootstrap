# Better Auth - Complete Authentication & User Management System

This document provides comprehensive instructions for setting up and using the Better Auth authentication system implemented in this project. This is a fully functional, production-ready authentication system that you can reuse in any new project.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Configuration](#configuration)
7. [Project Structure](#project-structure)
8. [Usage Guide](#usage-guide)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)

## Overview

This project implements a complete authentication and user management system using **Better Auth**, a modern authentication library for Next.js applications. The system includes:

- **Email/Password Authentication** with email verification
- **Social Authentication** (Google, GitHub)
- **Multi-Factor Authentication (MFA)** with TOTP
- **Multi-Tenant Support** with Organizations, Teams, and Invitations
- **Role-Based Access Control**
- **Password Reset** functionality
- **Session Management**

## Features

### ✅ Implemented Features

1. **Authentication**
   - Email/password sign up and sign in
   - Email verification
   - Password reset via email
   - Social authentication (Google, GitHub)
   - Multi-factor authentication (MFA/TOTP)

2. **User Management**
   - User profiles
   - Account settings
   - Session management

3. **Multi-Tenant System**
   - Organizations
   - Organization members
   - Teams within organizations
   - Invitation system
   - Role-based access (owner, admin, member)

4. **Security**
   - Secure password hashing
   - Session tokens
   - CSRF protection
   - Email verification
   - Two-factor authentication

## Installation

### Step 1: Install Dependencies

```bash
npm install better-auth @prisma/client
npm install -D prisma
```

### Step 2: Install Additional Packages (Already Included)

The following packages are already installed in this project:
- `better-auth` - Core authentication library
- `@prisma/client` - Prisma ORM client
- `prisma` - Prisma CLI
- `resend` - Email service (optional, for custom emails)
- `sonner` - Toast notifications
- `zod` - Schema validation

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/better-auth-app"
# Or for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-random-secret-key-here-minimum-32-characters"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
# Or for production:
# BETTER_AUTH_URL="https://yourdomain.com"
# NEXT_PUBLIC_BETTER_AUTH_URL="https://yourdomain.com"

# Social Authentication - Google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Social Authentication - GitHub
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email Service (SMTP Configuration for Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM_EMAIL="noreply@yourdomain.com"
APP_NAME="Better Auth App"
```

### Generating BETTER_AUTH_SECRET

Generate a secure random secret:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Setting Up OAuth Providers

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret

#### GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Set Application name and Homepage URL
4. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy the Client ID and Client Secret

## Database Setup

### Step 1: Configure Prisma

The Prisma schema is located at `prisma/schema.prisma`. It includes all necessary models for Better Auth and multi-tenant support.

### Step 2: Generate Prisma Client

```bash
npm run db:generate
# Or
npx prisma generate
```

### Step 3: Push Schema to Database

```bash
npm run db:push
# Or
npx prisma db push
```

### Step 4: (Optional) Open Prisma Studio

```bash
npm run db:studio
# Or
npx prisma studio
```

## Configuration

### Better Auth Server Configuration

The main configuration is in `src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { twoFactor } from "better-auth/plugins";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  plugins: [
    twoFactor(),
    organization({
      async sendInvitationEmail({ organization, invitation, url }) {
        // Custom email sending logic
      },
    }),
  ],
});
```

### Better Auth Client Configuration

Client configuration is in `src/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    inferAdditionalFields<{
      role: string;
    }>(),
    twoFactorClient({
      twoFactorPage: "/auth/two-factor",
    }),
    organizationClient(),
  ],
});
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts          # Better Auth API handler
│   ├── (auth)/
│   │   └── auth/
│   │       ├── login/                # Login page
│   │       ├── signup/               # Signup page
│   │       ├── forgot-password/     # Forgot password page
│   │       ├── reset-password/       # Reset password page
│   │       ├── confirm-otp/          # Email verification page
│   │       └── two-factor/            # 2FA verification page
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── organizations/        # Organization management
│   │       └── ...
│   ├── account/
│   │   └── settings/
│   │       └── two-factor/          # 2FA settings page
│   └── auth/
│       └── invite/
│           └── accept/               # Invitation acceptance page
├── components/
│   ├── auth-protection.tsx          # Auth protection wrapper
│   └── ...
├── lib/
│   ├── auth.ts                      # Better Auth server config
│   ├── auth-client.ts               # Better Auth client config
│   ├── auth-server.ts               # Server-side auth utilities
│   └── prisma.ts                    # Prisma client
└── middleware.ts                     # Next.js middleware
```

## Usage Guide

### Client-Side Authentication

#### Sign Up

```typescript
import { signUp } from "@/lib/auth-client";

const result = await signUp.email({
  email: "user@example.com",
  password: "securepassword",
  name: "John Doe",
});
```

#### Sign In

```typescript
import { signIn } from "@/lib/auth-client";

const result = await signIn.email({
  email: "user@example.com",
  password: "securepassword",
});
```

#### Social Authentication

```typescript
import { signIn } from "@/lib/auth-client";

// Google
await signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
});

// GitHub
await signIn.social({
  provider: "github",
  callbackURL: "/dashboard",
});
```

#### Get Session

```typescript
import { useSession } from "@/lib/auth-client";

function MyComponent() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;
  
  return <div>Welcome, {session.user.name}!</div>;
}
```

#### Sign Out

```typescript
import { signOut } from "@/lib/auth-client";

await signOut();
```

### Server-Side Authentication

```typescript
import { getServerSession, requireAuth } from "@/lib/auth-server";

// Get session (returns null if not authenticated)
const session = await getServerSession();

// Require authentication (redirects if not authenticated)
const session = await requireAuth();
```

### Multi-Factor Authentication

#### Setup 2FA

```typescript
import { authClient } from "@/lib/auth-client";

// Initiate 2FA setup
const result = await authClient.twoFactor.setup();

// Enable 2FA with verification code
await authClient.twoFactor.enable({
  code: "123456",
});
```

#### Verify 2FA

```typescript
await authClient.twoFactor.verify({
  code: "123456",
});
```

### Organization Management

#### Create Organization

```typescript
import { authClient } from "@/lib/auth-client";

const result = await authClient.organization.create({
  name: "Acme Inc.",
  slug: "acme-inc",
});
```

#### List Organizations

```typescript
const result = await authClient.organization.list();
```

#### Invite Member

```typescript
await authClient.organization.inviteMember({
  organizationId: "org-id",
  email: "user@example.com",
  role: "member", // or "admin", "owner"
});
```

#### Accept Invitation

```typescript
await authClient.organization.acceptInvitation({
  token: "invitation-token",
});
```

## API Reference

### Authentication Endpoints

All Better Auth endpoints are handled at `/api/auth/[...all]`:

- `POST /api/auth/sign-up/email` - Email sign up
- `POST /api/auth/sign-in/email` - Email sign in
- `POST /api/auth/sign-out` - Sign out
- `POST /api/auth/forget-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/session` - Get current session
- `GET /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/callback/github` - GitHub OAuth callback

### Two-Factor Authentication

- `POST /api/auth/two-factor/setup` - Setup 2FA
- `POST /api/auth/two-factor/enable` - Enable 2FA
- `POST /api/auth/two-factor/verify` - Verify 2FA code
- `POST /api/auth/two-factor/disable` - Disable 2FA

### Organization Management

- `POST /api/auth/organization/create` - Create organization
- `GET /api/auth/organization/list` - List organizations
- `GET /api/auth/organization/list-members` - List members
- `POST /api/auth/organization/invite-member` - Invite member
- `POST /api/auth/organization/accept-invitation` - Accept invitation
- `POST /api/auth/organization/remove-member` - Remove member

## Troubleshooting

### Common Issues

#### 1. "Invalid session" errors

- Check that `BETTER_AUTH_SECRET` is set correctly
- Ensure cookies are enabled in the browser
- Verify `BETTER_AUTH_URL` matches your application URL

#### 2. OAuth redirect errors

- Verify callback URLs match exactly in OAuth provider settings
- Check that client IDs and secrets are correct
- Ensure redirect URLs are whitelisted

#### 3. Database connection errors

- Verify `DATABASE_URL` is correct
- Check MongoDB is running (if local)
- Verify network access (if using MongoDB Atlas)

#### 4. Email verification not working

- Check email service configuration
- Verify email templates are set up correctly
- Check spam folder

#### 5. Prisma client errors

- Run `npm run db:generate` to regenerate Prisma client
- Ensure schema is pushed: `npm run db:push`
- Check for schema syntax errors

### Debug Mode

Enable debug logging in Better Auth:

```typescript
// In src/lib/auth.ts
export const auth = betterAuth({
  // ... other config
  debug: process.env.NODE_ENV === "development",
});
```

## Reusing in New Projects

To reuse this authentication system in a new project:

1. **Copy Configuration Files**
   - `src/lib/auth.ts`
   - `src/lib/auth-client.ts`
   - `src/lib/auth-server.ts`
   - `src/lib/prisma.ts`
   - `prisma/schema.prisma`
   - `src/app/api/auth/[...all]/route.ts`

2. **Copy Auth Pages**
   - All pages in `src/app/(auth)/auth/`
   - Organization pages in `src/app/dashboard/organizations/`
   - 2FA pages

3. **Install Dependencies**
   ```bash
   npm install better-auth @prisma/client
   npm install -D prisma
   ```

4. **Set Up Environment Variables**
   - Copy `.env.example` or create new `.env` file
   - Fill in all required variables

5. **Initialize Database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Update Routes**
   - Adjust protected routes in `src/middleware.ts`
   - Update redirect URLs in auth pages

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

For issues specific to this implementation, check:
1. Environment variables are set correctly
2. Database connection is working
3. OAuth providers are configured
4. Prisma schema is synced

For Better Auth specific issues, refer to the [Better Auth documentation](https://www.better-auth.com/docs).

---

**Last Updated:** November 2024
**Better Auth Version:** 1.4.0
**Next.js Version:** 15.5.2

