"use client";

import React, { useState } from "react";
import { Link as LinkType } from "@/store/linkStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, AlertCircle, Link2 } from "lucide-react";

interface DuplicateLinkModalProps {
  isOpen: boolean;
  link: LinkType | null;
  onClose: () => void;
  onGoToLink: (shortCode: string) => void;
}

export default function DuplicateLinkModal({
  isOpen,
  link,
  onClose,
  onGoToLink,
}: DuplicateLinkModalProps) {
  const [copied, setCopied] = useState(false);

  if (!link) return null;

  const shortUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/r/${link.shortCode}`
      : `/r/${link.shortCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto sm:mx-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Link Already Shortened
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-muted-foreground text-sm">
              This destination has already been shortened. You can use the existing short link below.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Display the link name when available. */}
          {link.name && (
            <div className="px-3 py-2 bg-accent/40 rounded-lg border border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                Link name
              </span>
              <span className="text-xs font-semibold text-foreground">
                {link.name}
              </span>
            </div>
          )}

          {/* Original URL */}
          <div className="p-3 bg-muted/50 rounded-lg border border-border space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">
              Original URL
            </span>
            <p
              className="text-xs font-mono text-foreground break-all line-clamp-2"
              title={link.originalUrl}
            >
              {link.originalUrl}
            </p>
          </div>

          {/* Short link with copy button */}
          <div className="p-3.5 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Link2 size={14} />
                Short link
              </span>
              <span className="text-[11px] text-muted-foreground">
                Code: <span className="font-mono font-semibold">/{link.shortCode}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-2">
              <span className="text-sm font-mono font-medium text-foreground truncate flex-1 select-all">
                {shortUrl}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleCopy}
                className="h-8 w-8 shrink-0 hover:bg-muted"
                title={copied ? "Copied" : "Copy link"}
              >
                {copied ? (
                  <Check size={16} className="text-emerald-500" />
                ) : (
                  <Copy size={16} className="text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => onGoToLink(link.shortCode)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} />
            Open link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

