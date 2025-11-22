import { prisma } from "./prisma";

export interface ActivityLogData {
  userId: string;
  organizationId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logActivity(data: ActivityLogData) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        description: data.description,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - activity logging should not break the main flow
  }
}

export async function getActivityLogs(
  organizationId?: string,
  userId?: string,
  limit: number = 50,
  offset: number = 0
) {
  const where: {
    organizationId?: string;
    userId?: string;
  } = {};
  
  if (organizationId) {
    where.organizationId = organizationId;
  }
  
  if (userId) {
    where.userId = userId;
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
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
    prisma.activityLog.count({ where }),
  ]);

  return {
    logs: logs.map(log => ({
      ...log,
      metadata: log.metadata ? (JSON.parse(log.metadata) as Record<string, unknown>) : null,
    })),
    total,
  };
}

