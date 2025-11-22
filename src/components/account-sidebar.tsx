"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard,
  Key,
  LogOut,
  X,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AccountSidebar({ isOpen, onToggle }: AccountSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Profile",
      href: "/account/profile",
      icon: User,
    },
    {
      name: "Settings",
      href: "/account/settings",
      icon: Settings,
    },
    {
      name: "Notifications",
      href: "/account/notifications",
      icon: Bell,
    },
    {
      name: "Security",
      href: "/account/security",
      icon: Shield,
    },
    {
      name: "Billing",
      href: "/account/billing",
      icon: CreditCard,
    },
    {
      name: "API Keys",
      href: "/account/api-keys",
      icon: Key,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/account" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary"></div>
              <span className="text-xl font-bold">Account</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Back to Dashboard */}
          <div className="px-4 py-3 border-b">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-4">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/auth/login">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
