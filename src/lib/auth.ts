import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { twoFactor } from "better-auth/plugins";
import { organization } from "better-auth/plugins";
import { sendEmail } from "./email";
import { emailTemplates } from "./email-templates";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendVerificationEmail({ user, url }: { user: { name: string | null; email: string }; url: string }) {
      try {
        const template = emailTemplates.verification(user.name || "User", url);
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html,
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw error;
      }
    },
    async sendPasswordResetEmail({ user, url }: { user: { name: string | null; email: string }; url: string }) {
      try {
        const template = emailTemplates.passwordReset(user.name || "User", url);
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html,
        });
      } catch (error) {
        console.error("Failed to send password reset email:", error);
        throw error;
      }
    },
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
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },
  plugins: [
    twoFactor(),
    organization({
      async sendInvitationEmail(data) {
        try {
          // Get the invitation token from database using the invitation id
          const invitationRecord = await prisma.invitation.findUnique({
            where: { id: data.invitation.id },
            select: { token: true },
          });

          if (!invitationRecord) {
            throw new Error("Invitation not found");
          }

          // Construct the invitation URL
          const baseURL = process.env.BETTER_AUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
          const url = `${baseURL}/auth/invite/accept?token=${invitationRecord.token}`;

          const template = emailTemplates.invitation(
            data.organization.name,
            data.inviter.user.name || "Someone",
            url,
            data.role
          );

          await sendEmail({
            to: data.email,
            subject: template.subject,
            html: template.html,
          });
        } catch (error) {
          console.error("Failed to send invitation email:", error);
          throw error;
        }
      },
    }),
  ],
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
});

export type Session = typeof auth.$Infer.Session;
