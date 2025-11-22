"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Bell, 
  Settings
} from "lucide-react";

interface AccountHeaderProps {
  onMenuClick: () => void;
}

export function AccountHeader({ onMenuClick }: AccountHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* User Info */}
      <div className="flex items-center space-x-4 flex-1">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/avatars/01.png" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">John Doe</h1>
          <p className="text-sm text-muted-foreground truncate">john.doe@example.com</p>
        </div>
        <Badge variant="outline">Pro Plan</Badge>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </header>
  );
}
