"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Copy, CheckCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function TwoFactorSettingsPage() {
  const { data: session } = useSession();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    // Check if 2FA is already enabled
    if (session?.user) {
      // You would fetch this from your API
      // For now, we'll assume it's disabled initially
    }
  }, [session]);

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/two-factor/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      
      if (!response.ok || result.error) {
        toast.error(result.error?.message || "Failed to setup 2FA");
        setIsLoading(false);
        return;
      }

      setSetupData({
        secret: result.data?.secret || "",
        qrCode: result.data?.qrCode || "",
        backupCodes: result.data?.backupCodes || [],
      });
      toast.success("2FA setup initiated. Please verify with your authenticator app.");
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/auth/two-factor/enable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        toast.error(result.error?.message || "Invalid verification code");
        setIsVerifying(false);
        return;
      }

      setIsEnabled(true);
      setIsSetupComplete(true);
      setSetupData(null);
      toast.success("Two-factor authentication enabled successfully!");
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/two-factor/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      
      if (!response.ok || result.error) {
        toast.error(result.error?.message || "Failed to disable 2FA");
        setIsLoading(false);
        return;
      }

      setIsEnabled(false);
      toast.success("Two-factor authentication disabled.");
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      toast.success("Secret copied to clipboard");
    }
  };

  if (isSetupComplete) {
    return (
      <Card>
        <CardContent className="pt-8">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">2FA Enabled!</h2>
              <p className="text-muted-foreground">
                Two-factor authentication has been successfully enabled for your account.
              </p>
            </div>
            <Button onClick={() => setIsSetupComplete(false)}>
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="2fa-toggle">Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Require a verification code in addition to your password
              </p>
            </div>
            <Switch
              id="2fa-toggle"
              checked={isEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleEnable2FA();
                } else {
                  handleDisable2FA();
                }
              }}
              disabled={isLoading || !!setupData}
            />
          </div>

          {setupData && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label>Scan QR Code</Label>
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                  {setupData.qrCode && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={setupData.qrCode} alt="QR Code" className="w-48 h-48" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Scan this QR code with your authenticator app
                </p>
              </div>

              <div className="space-y-2">
                <Label>Or enter this secret key manually</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-background border rounded text-sm">
                    {setupData.secret}
                  </code>
                  <Button variant="outline" size="icon" onClick={copySecret}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Enter verification code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                    disabled={isVerifying}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  className="w-full"
                  onClick={handleVerifyAndEnable}
                  disabled={isVerifying || verificationCode.length !== 6}
                >
                  {isVerifying ? "Verifying..." : "Verify and Enable"}
                </Button>
              </div>

              {setupData.backupCodes.length > 0 && (
                <div className="space-y-2">
                  <Label>Backup Codes</Label>
                  <div className="p-4 bg-background border rounded space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Save these backup codes in a safe place. You can use them to access your account if you lose your device.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {setupData.backupCodes.map((code, index) => (
                        <code key={index} className="p-2 bg-muted rounded text-sm text-center">
                          {code}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

