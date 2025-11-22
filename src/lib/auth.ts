import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { twoFactor } from "better-auth/plugins";
import { organization } from "better-auth/plugins";
import { sendEmail } from "./email";
import { emailTemplates } from "./email-templates";
import { ObjectId } from "mongodb";
import type { DBAdapter } from "better-auth/adapters";

// Custom ID generator for MongoDB ObjectIDs
const mongoObjectIdGenerator = () => new ObjectId().toString();

// Wrap the Prisma adapter to ensure all IDs are valid MongoDB ObjectIDs
// prismaAdapter returns a function that Better Auth calls with options
const baseAdapterFactory = prismaAdapter(prisma, {
  provider: "mongodb",
});

// Helper function to transform IDs to valid ObjectIDs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformIdsToObjectIds = (data: any): any => {
  if (!data || typeof data !== "object") return data;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformed: any = Array.isArray(data) ? [...data] : { ...data };
  
  // Always check and transform the main ID field
  if (transformed.id !== undefined && transformed.id !== null) {
    if (typeof transformed.id === "string") {
      // If it's not a valid ObjectID, replace it
      if (!ObjectId.isValid(transformed.id)) {
        transformed.id = mongoObjectIdGenerator();
      }
    }
  }
  
  // Transform foreign key IDs that need to be ObjectIDs
  // Skip provider-specific fields that aren't ObjectIDs
  const objectIdFields = ["userId", "organizationId", "teamId", "inviterId", "permissionId"];
  for (const key of Object.keys(transformed)) {
    const value = transformed[key];
    if (objectIdFields.includes(key) && value !== undefined && value !== null) {
      if (typeof value === "string" && !ObjectId.isValid(value)) {
        transformed[key] = mongoObjectIdGenerator();
      }
    }
  }
  
  return transformed;
};

// Create a wrapper function that Better Auth will call
const createMongoAdapter = (options: Parameters<typeof baseAdapterFactory>[0]) => {
  const baseAdapter = baseAdapterFactory(options);
  
  // Create a wrapper adapter that transforms IDs to valid ObjectIDs
  return {
    ...baseAdapter,
    async create({ model, data, select, forceAllowId }: Parameters<DBAdapter["create"]>[0]) {
      // Log for debugging (remove in production)
      if (process.env.NODE_ENV === "development" && data && typeof data === "object" && "id" in data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const originalId = (data as any).id;
        if (originalId && typeof originalId === "string" && !ObjectId.isValid(originalId)) {
          console.log(`[MongoDB Adapter] Transforming invalid ID for model ${model}:`, originalId);
        }
      }
      
      const transformedData = transformIdsToObjectIds(data);
      
      // Double-check the transformation worked
      if (transformedData && typeof transformedData === "object" && "id" in transformedData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalId = (transformedData as any).id;
        if (finalId && typeof finalId === "string" && !ObjectId.isValid(finalId)) {
          console.error(`[MongoDB Adapter] ERROR: ID still invalid after transformation for model ${model}:`, finalId);
          // Force replace with valid ObjectID
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (transformedData as any).id = mongoObjectIdGenerator();
        }
      }
      
      return baseAdapter.create({ model, data: transformedData, select, forceAllowId });
    },
    // Also wrap update operations in case they create new records
    async update({ model, where, update }: Parameters<DBAdapter["update"]>[0]) {
      const transformedUpdate = transformIdsToObjectIds(update);
      return baseAdapter.update({ model, where, update: transformedUpdate });
    },
  } as DBAdapter;
};

export const auth = betterAuth({
  database: createMongoAdapter,
  generateId: mongoObjectIdGenerator,
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
