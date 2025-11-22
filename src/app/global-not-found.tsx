import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <head>
        <title>Not Found - YourApp</title>
        <meta name="description" content="The global page you're looking for doesn't exist." />
      </head>
      <body className="min-h-screen flex items-center justify-center bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Not Found</CardTitle>
              <CardDescription>
                The global page you&apos;re looking for doesn&apos;t exist.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>The global page you requested might have been moved, deleted, or doesn&apos;t exist.</p>
              </div>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Go to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
