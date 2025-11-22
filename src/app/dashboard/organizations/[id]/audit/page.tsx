"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface AuditTrail {
  id: string;
  action: "create" | "update" | "delete";
  resourceType: string;
  resourceId: string;
  reason?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  createdAt: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export default function AuditTrailsPage() {
  const params = useParams();
  const organizationId = params.id as string;

  const [trails] = useState<AuditTrail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrail, setSelectedTrail] = useState<AuditTrail | null>(null);

  const fetchTrails = useCallback(async () => {
    try {
      // In a real app, you'd call your API
      // const response = await getAuditTrails(organizationId);
      // setTrails(response.trails);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrails();
  }, [fetchTrails]);

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "default";
      case "update":
        return "secondary";
      case "delete":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/organizations/${organizationId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Audit Trails
          </h1>
          <p className="text-muted-foreground">
            Complete audit history of all changes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit History</CardTitle>
          <CardDescription>
            Detailed log of all changes made to resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trails.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No audit trails yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trails.map((trail) => (
                  <TableRow key={trail.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={trail.user.image} alt={trail.user.name} />
                          <AvatarFallback>
                            {getInitials(trail.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{trail.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {trail.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionColor(trail.action)}>
                        {trail.action.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {trail.resourceType}: {trail.resourceId.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground truncate">
                        {trail.reason || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(trail.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTrail(trail)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedTrail && (
        <Card>
          <CardHeader>
            <CardTitle>Change Details</CardTitle>
            <CardDescription>
              Before and after values for this change
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedTrail.changes?.before && (
                <div>
                  <h4 className="font-semibold mb-2">Before</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(selectedTrail.changes.before, null, 2)}
                  </pre>
                </div>
              )}
              {selectedTrail.changes?.after && (
                <div>
                  <h4 className="font-semibold mb-2">After</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(selectedTrail.changes.after, null, 2)}
                  </pre>
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedTrail(null)}>
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

