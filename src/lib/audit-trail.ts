import { prisma } from "./prisma";

export interface AuditTrailData {
  userId: string;
  organizationId?: string;
  action: "create" | "update" | "delete";
  resourceType: string;
  resourceId: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditTrail(data: AuditTrailData) {
  try {
    await prisma.auditTrail.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        changes: data.changes ? JSON.stringify(data.changes) : null,
        reason: data.reason,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create audit trail:", error);
    // Don't throw - audit trails should not break the main flow
  }
}

export async function getAuditTrails(
  organizationId?: string,
  resourceType?: string,
  resourceId?: string,
  limit: number = 50,
  offset: number = 0
) {
  const where: {
    organizationId?: string;
    resourceType?: string;
    resourceId?: string;
  } = {};
  
  if (organizationId) {
    where.organizationId = organizationId;
  }
  
  if (resourceType) {
    where.resourceType = resourceType;
  }
  
  if (resourceId) {
    where.resourceId = resourceId;
  }

  const [trails, total] = await Promise.all([
    prisma.auditTrail.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    }),
    prisma.auditTrail.count({ where }),
  ]);

  return {
    trails: trails.map(trail => ({
      ...trail,
      changes: trail.changes ? (JSON.parse(trail.changes) as { before?: Record<string, unknown>; after?: Record<string, unknown> }) : null,
    })),
    total,
  };
}

