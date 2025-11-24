import React, { useState } from "react";
import { Link as LinkIcon, Sparkles } from "@/assets/icons";
import { useLinkStore } from "@/store/linkStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [url, setUrl] = useState("");
  const addLink = useLinkStore((state) => state.addLink);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addLink({
      id: Math.random().toString(36).substr(2, 9),
      originalUrl: url,
      shortCode: Math.random().toString(36).substr(2, 6),
      clicks: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    setUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
  );
};

export default CreateLinkModal;
