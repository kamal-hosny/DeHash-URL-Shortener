"use client";

import React, { useState } from "react";
import { Link as LinkIcon, Sparkles } from "@/assets/icons";
import { useLinkStore, Link as LinkType } from "@/store/linkStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { normalizeUrl } from "@/lib/utils";
import DuplicateLinkModal from "./DuplicateLinkModal";

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [url, setUrl] = useState("");
  const [duplicateLink, setDuplicateLink] = useState<LinkType | null>(null);
  const { links, addLink } = useLinkStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    // Check if the exact or normalized URL already exists
    const normalizedInput = normalizeUrl(cleanUrl);
    const existing = links.find(
      (l) => normalizeUrl(l.originalUrl) === normalizedInput
    );

    if (existing) {
      // Do NOT create duplicate short link. Show duplicate popup dialog!
      setDuplicateLink(existing);
      return;
    }

    const newLink: LinkType = {
      id: Math.random().toString(36).substring(2, 11),
      originalUrl: cleanUrl,
      shortCode: Math.random().toString(36).substring(2, 8),
      clicks: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    addLink(newLink);

    // Sync to backend persistent store
    fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLink),
    }).catch((err) => console.error("Error syncing link to backend:", err));

    setUrl("");
    onClose();
  };

  const handleGoToLink = (shortCode: string) => {
    window.open(`/r/${shortCode}`, "_blank");
    setDuplicateLink(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !duplicateLink} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Shorten URL</DialogTitle>
            <DialogDescription>
              Create a new short link to share.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="url"
                className="text-sm font-medium text-foreground"
              >
                Destination URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <LinkIcon size={16} className="text-muted-foreground" />
                </div>
                <Input
                  type="url"
                  id="url"
                  required
                  placeholder="https://example.com/long-url"
                  className="pl-10"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Sparkles />
              Create Short Link
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Duplicate Link Detected Popup Dialog */}
      <DuplicateLinkModal
        isOpen={!!duplicateLink}
        link={duplicateLink}
        onClose={() => setDuplicateLink(null)}
        onGoToLink={handleGoToLink}
      />
    </>
  );
};

export default CreateLinkModal;
