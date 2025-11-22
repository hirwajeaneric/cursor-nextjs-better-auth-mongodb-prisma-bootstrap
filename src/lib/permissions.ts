import { prisma } from "./prisma";

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage";
export type ResourceType =
  | "organization"
  | "team"
  | "user"
  | "invitation"
  | "member";

export interface PermissionCheck {
  resource: ResourceType;
  action: PermissionAction;
}

// Initialize default permissions
export async function initializePermissions() {
  const defaultPermissions = [
    // Organization permissions
    {
      name: "organization.create",
      resource: "organization",
      action: "create",
      description: "Create organizations",
    },
    {
      name: "organization.read",
      resource: "organization",
      action: "read",
      description: "View organization details",
    },
    {
      name: "organization.update",
      resource: "organization",
      action: "update",
      description: "Update organization settings",
    },
    {
      name: "organization.delete",
      resource: "organization",
      action: "delete",
      description: "Delete organizations",
    },
    {
      name: "organization.manage",
      resource: "organization",
      action: "manage",
      description: "Full organization management",
    },

    // Team permissions
    {
      name: "team.create",
      resource: "team",
      action: "create",
      description: "Create teams",
    },
    {
      name: "team.read",
      resource: "team",
      action: "read",
      description: "View teams",
    },
    {
      name: "team.update",
      resource: "team",
      action: "update",
      description: "Update teams",
    },
    {
      name: "team.delete",
      resource: "team",
      action: "delete",
      description: "Delete teams",
    },
    {
      name: "team.manage",
      resource: "team",
      action: "manage",
      description: "Full team management",
    },

    // Member permissions
    {
      name: "member.invite",
      resource: "member",
      action: "create",
      description: "Invite members",
    },
    {
      name: "member.read",
      resource: "member",
      action: "read",
      description: "View members",
    },
    {
      name: "member.update",
      resource: "member",
      action: "update",
      description: "Update member roles",
    },
    {
      name: "member.remove",
      resource: "member",
      action: "delete",
      description: "Remove members",
    },
    {
      name: "member.manage",
      resource: "member",
      action: "manage",
      description: "Full member management",
    },

    // Invitation permissions
    {
      name: "invitation.create",
      resource: "invitation",
      action: "create",
      description: "Create invitations",
    },
    {
      name: "invitation.read",
      resource: "invitation",
      action: "read",
      description: "View invitations",
    },
    {
      name: "invitation.cancel",
      resource: "invitation",
      action: "delete",
      description: "Cancel invitations",
    },
  ];

  for (const perm of defaultPermissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // Set up role permissions
  const roles = [
    {
      role: "owner",
      permissions: [
        "organization.manage",
        "team.manage",
        "member.manage",
        "invitation.create",
        "invitation.read",
        "invitation.cancel",
      ],
    },
    {
      role: "admin",
      permissions: [
        "organization.read",
        "organization.update",
        "team.manage",
        "member.invite",
        "member.read",
        "member.update",
        "member.remove",
        "invitation.create",
        "invitation.read",
        "invitation.cancel",
      ],
    },
    {
      role: "member",
      permissions: ["organization.read", "team.read", "member.read"],
    },
  ];

  for (const roleConfig of roles) {
    for (const permName of roleConfig.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permName },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            role_permissionId_organizationId: {
              role: roleConfig.role,
              permissionId: permission.id,
              organizationId: "", // Global permissions
            },
          },
          update: {},
          create: {
            role: roleConfig.role,
            permissionId: permission.id,
            organizationId: null,
          },
        });
      }
    }
  }
}

export async function hasPermission(
  userId: string,
  organizationId: string | null,
  resource: ResourceType,
  action: PermissionAction
): Promise<boolean> {
  // Get user's role in the organization
  let userRole: string | null = null;

  if (organizationId) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });
    userRole = membership?.role || null;
  }

  if (!userRole) {
    return false;
  }

  // Check for specific permission
  const permissionName = `${resource}.${action}`;
  const permission = await prisma.permission.findUnique({
    where: { name: permissionName },
  });

  if (!permission) {
    // Check for manage permission
    const managePermission = await prisma.permission.findUnique({
      where: { name: `${resource}.manage` },
    });

    if (managePermission) {
      const hasManage = await prisma.rolePermission.findUnique({
        where: {
          role_permissionId_organizationId: {
            role: userRole,
            permissionId: managePermission.id,
            organizationId: organizationId || "",
          },
        },
      });

      if (hasManage) return true;
    }

    return false;
  }

  const rolePermission = await prisma.rolePermission.findUnique({
    where: {
      role_permissionId_organizationId: {
        role: userRole,
        permissionId: permission.id,
        organizationId: organizationId || "",
      },
    },
  });

  return !!rolePermission;
}

export async function requirePermission(
  userId: string,
  organizationId: string | null,
  resource: ResourceType,
  action: PermissionAction
): Promise<void> {
  const hasAccess = await hasPermission(
    userId,
    organizationId,
    resource,
    action
  );
  if (!hasAccess) {
    throw new Error(`Permission denied: ${resource}.${action}`);
  }
}
