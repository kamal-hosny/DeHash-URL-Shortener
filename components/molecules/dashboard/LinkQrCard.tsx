"use client";

import React, { useState, useRef } from "react";
import { useToast } from "@/hooks/useToast";
import { Download, Copy, Check, Share2 } from "@/assets/icons";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LinkQrCardProps {
  url: string;
}

// 🎨 Predefined Styles
const QR_STYLES = [
  { name: "Default", fg: "#000000", bg: "#ffffff" },
  { name: "Dark", fg: "#ffffff", bg: "#000000" },
  { name: "Navy", fg: "#ffffff", bg: "#0f172a" },
  { name: "Red", fg: "#ffffff", bg: "#ef4444" },
  { name: "Blue", fg: "#ffffff", bg: "#3b82f6" },
  { name: "Emerald", fg: "#ffffff", bg: "#10b981" },
  { name: "Purple", fg: "#ffffff", bg: "#8b5cf6" },
];

const LinkQrCard: React.FC<LinkQrCardProps> = ({ url }) => {
  const { toast } = useToast();
  const [selectedStyle, setSelectedStyle] = useState(QR_STYLES[0]);
  const [isCopied, setIsCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const getQrImage = (callback: (blob: Blob | null) => void) => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40; // Add padding
      canvas.height = img.height + 40;

      if (ctx) {
        // Draw background
        ctx.fillStyle = selectedStyle.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR code centered
        ctx.drawImage(img, 20, 20);
      }

      canvas.toBlob(callback);
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleDownload = () => {
    getQrImage((blob) => {
      if (blob) {
        const link = document.createElement("a");
        link.download = `qr-code-${Date.now()}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        toast({
          title: "Downloaded!",
          description: "QR Code has been saved to your device.",
        });
      }
    });
  };

  const handleCopyImage = () => {
    getQrImage(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setIsCopied(true);
          toast({
            title: "Copied!",
            description: "QR Code image copied to clipboard.",
          });
          setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy image:", err);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to copy image to clipboard.",
          });
        }
      }
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          QR Code
        </CardTitle>
        <CardDescription>
          Customize and download the QR code for this link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Preview */}
        <div
          className="relative flex items-center justify-center p-8 rounded-xl border border-border shadow-sm transition-colors duration-300"
          style={{ backgroundColor: selectedStyle.bg }}
          ref={qrRef}
        >
          <QRCode
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={url}
            fgColor={selectedStyle.fg}
            bgColor={selectedStyle.bg}
            level="H"
          />
        </div>

        {/* Style Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">
            Select Theme
          </label>
          <div className="flex flex-wrap gap-3">
            {QR_STYLES.map((style) => (
              <button
                key={style.name}
                onClick={() => setSelectedStyle(style)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  selectedStyle.name === style.name
                    ? "border-primary ring-2 ring-ring ring-offset-1"
                    : "border-accent hover:border-border"
                )}
                style={{ backgroundColor: style.bg }}
                title={style.name}
              >
                {/* Show checkmark if selected, contrasting color */}
                {selectedStyle.name === style.name && (
                  <span
                    className="flex items-center justify-center w-full h-full"
                    style={{ color: style.fg }}
                  >
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleCopyImage}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="default"
            className="flex-1 gap-2"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkQrCard;
