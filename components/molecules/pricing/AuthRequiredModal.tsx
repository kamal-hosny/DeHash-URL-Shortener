"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Lock, Sparkles } from "lucide-react";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  billingCycle: "monthly" | "yearly";
  planPrice?: string;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  planName,
  billingCycle,
  planPrice,
}) => {
  const router = useRouter();

  const targetUrl = `/dashboard/billing?plan=${encodeURIComponent(
    planName.toLowerCase()
  )}&cycle=${billingCycle}`;

  const handleSignIn = () => {
    onClose();
    router.push(`/signin?callbackUrl=${encodeURIComponent(targetUrl)}`);
  };

  const handleSignUp = () => {
    onClose();
    router.push(`/signup?callbackUrl=${encodeURIComponent(targetUrl)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl p-6 sm:p-8">
        <DialogHeader className="space-y-3 text-center sm:text-left">
          <div className="mx-auto sm:mx-0 w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
            <Lock className="w-6 h-6" />
          </div>

          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 justify-center sm:justify-start">
            <span>Sign In Required</span>
          </DialogTitle>

          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            Please sign in or create an account to subscribe to the{" "}
            <strong className="text-foreground font-semibold">
              {planName} Plan
            </strong>{" "}
            and access your subscription management dashboard.
          </DialogDescription>
        </DialogHeader>

        {/* Plan Preview Pill */}
        <div className="p-3.5 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-between my-2">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{planName} Plan</span>
          </div>
          <div className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            {planPrice || (billingCycle === "yearly" ? "$9/mo billed yearly" : "$12/mo")}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2.5 sm:gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            Cancel
          </Button>

          <Button
            variant="outline"
            onClick={handleSignUp}
            className="w-full sm:w-auto gap-2 border-primary/30 hover:bg-primary/10 order-2"
          >
            <UserPlus className="w-4 h-4 text-primary" />
            Create Account
          </Button>

          <Button
            onClick={handleSignIn}
            className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md order-1 sm:order-3"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
