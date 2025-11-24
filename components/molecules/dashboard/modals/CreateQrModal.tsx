import React, { useState, useRef } from "react";
import { Download, Copy, Check, Share2 } from "@/assets/icons";
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreateQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
}

const QR_STYLES = [
  { name: "Default", fg: "#000000", bg: "#ffffff" },
  { name: "Dark", fg: "#ffffff", bg: "#000000" },
  { name: "Navy", fg: "#ffffff", bg: "#0f172a" },
  { name: "Red", fg: "#ffffff", bg: "#ef4444" },
  { name: "Blue", fg: "#ffffff", bg: "#3b82f6" },
  { name: "Emerald", fg: "#ffffff", bg: "#10b981" },      
  { name: "Purple", fg: "#ffffff", bg: "#8b5cf6" },      

];


const CreateQrModal: React.FC<CreateQrModalProps> = ({
  isOpen,
  onClose,
  url = "https://github.com/",
}) => {
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
          setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy image:", err);
        }
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share QR Code
          </DialogTitle>
          <DialogDescription>
            Customize and download your QR code to share your link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
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
            <label className="text-sm font-medium text-muted-foreground ">
              Select Theme
            </label>
            <div className="flex flex-wrap mt-4 gap-3">
              {QR_STYLES.map((style) => (
                <button
                  key={style.name}
                  onClick={() => setSelectedStyle(style)}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    selectedStyle.name === style.name
                      ? "border-primary ring-2 ring-ring ring-offset-1"
                      : "  border-accent hover:border-border"
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
                      <Check className="w-5 h-5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
                  Copy Image
                </>
              )}
            </Button>
            <Button
              variant="default"
              className="flex-1 gap-2"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Download PNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQrModal;
