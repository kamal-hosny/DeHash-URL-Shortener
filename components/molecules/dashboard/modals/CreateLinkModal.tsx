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
import { normalizeUrl, generateShortCode } from "@/lib/utils";
import DuplicateLinkModal from "./DuplicateLinkModal";

export interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [duplicateLink, setDuplicateLink] = useState<LinkType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { links, addLink } = useLinkStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl || isLoading) return;

    const normalizedInput = normalizeUrl(cleanUrl);
    const existingLink = links.find(
      (link) => normalizeUrl(link.originalUrl) === normalizedInput
    );

    if (existingLink) {
      setDuplicateLink(existingLink);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: cleanUrl,
          name: name.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.duplicate && data.link) {
        setDuplicateLink(data.link);
        return;
      }

      if (data.success && data.link) {
        addLink(data.link);
        setName("");
        setUrl("");
        onClose();
        return;
      }
    } catch (error) {
      console.warn("API link creation failed, using local generation fallback:", error);
    } finally {
      setIsLoading(false);
    }

    // Client fallback: Generate Code -> Check Store -> هل موجود؟ -> Yes: Generate Again / No: Save
    let fallbackCode = generateShortCode();
    let attempts = 0;
    while (
      links.some((l) => l.shortCode.toLowerCase() === fallbackCode.toLowerCase()) &&
      attempts < 10
    ) {
      fallbackCode = generateShortCode();
      attempts++;
    }

    const fallbackLink: LinkType = {
      id: Math.random().toString(36).substring(2, 11),
      name: name.trim() || undefined,
      originalUrl: cleanUrl,
      shortCode: fallbackCode,
      clicks: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    addLink(fallbackLink);
    setName("");
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
              Create a shareable short link with an optional name for easier tracking.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Link name <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Input
                type="text"
                id="name"
                placeholder="e.g. My Portfolio or YouTube Video"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="url"
                className="text-sm font-medium text-foreground"
              >
                Destination URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 pointer-events-none">
                  <LinkIcon size={16} className="text-muted-foreground" />
                </div>
                <Input
                  type="url"
                  id="url"
                  required
                  placeholder="https://example.com/long-url"
                  className="pl-10"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              <Sparkles className={isLoading ? "animate-spin" : ""} />
              {isLoading ? "Creating Short Link..." : "Create Short Link"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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
