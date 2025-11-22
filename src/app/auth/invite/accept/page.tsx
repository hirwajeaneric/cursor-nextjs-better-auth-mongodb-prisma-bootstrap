"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Building2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [organizationName, setOrganizationName] = useState<string>("");

  const handleAcceptInvitation = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/auth/organization/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        toast.error(result.error?.message || "Failed to accept invitation");
        setStatus("error");
        setIsLoading(false);
        return;
      }

      setOrganizationName(result.data?.organization?.name || "Organization");
      setStatus("success");
      toast.success("Invitation accepted successfully!");

      setTimeout(() => {
        router.push("/dashboard/organizations");
      }, 2000);
    } catch {
      toast.error("An error occurred. Please try again.");
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setIsLoading(false);
      return;
    }

    handleAcceptInvitation();
  }, [token, handleAcceptInvitation]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto mt-20">
        <CardContent className="pt-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Processing invitation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-md mx-auto mt-20">
        <CardContent className="pt-8">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Invalid Invitation</h2>
              <p className="text-muted-foreground">
                This invitation link is invalid or has expired. Please contact the organization administrator for a new invitation.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardContent className="pt-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Invitation Accepted!</h2>
            <p className="text-muted-foreground">
              You have successfully joined <strong>{organizationName}</strong>.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Redirecting to organizations...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md mx-auto mt-20">
        <CardContent className="pt-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}

