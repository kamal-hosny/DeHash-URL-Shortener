"use client";
import React, { useState } from "react";
import { Link, QrCode, Check, Sparkles, Zap } from "@/assets/icons/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Hero() {
  const [activeTab, setActiveTab] = useState("qr");
  const [url, setUrl] = useState("");

  return (
    <div className="relative">
      {/* particles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="absolute top-20 left-20 text-blue-400/40 text-4xl animate-pulse">
        ✦
      </div>
      <div className="absolute top-32 right-32 text-purple-400/40 text-2xl animate-pulse delay-500">
        ✦
      </div>
      <div className="absolute bottom-40 left-40 text-blue-400/40 text-3xl animate-pulse delay-700">
        ✦
      </div>
      <div className="absolute top-60 right-60 text-purple-400/40 text-xl animate-pulse delay-300">
        •
      </div>
      <div className="absolute top-1/2 left-1/4 text-blue-400/30 text-lg animate-pulse delay-1000">
        ✦
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-20 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 bg-secondary/30 border border-secondary/50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm text-primary font-medium">
              Build Your Digital Presence
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent px-2">
            Build stronger digital
            <br />
            connections
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light px-4">
            Use our URL shortener, QR Codes, and landing pages to engage your
            audience and connect them to the right information.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center px-4">
          <Button
            onClick={() => setActiveTab("link")}
            variant={activeTab === "link" ? "default" : "outline"}
            size="lg"
            className={activeTab === "link" ? "scale-105" : ""}
          >
            <Link className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Short Link</span>
            <span className="sm:hidden">Link</span>
          </Button>

          <Button
            onClick={() => setActiveTab("qr")}
            variant={activeTab === "qr" ? "default" : "outline"}
            size="lg"
            className={activeTab === "qr" ? "scale-105" : ""}
          >
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
            QR Code
          </Button>
        </div>

        {/* Main Card */}
        <div className="bg-card/60 text-card-foreground backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 md:p-10 lg:p-14 shadow-2xl border border-border/50 relative overflow-hidden mx-4 sm:mx-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl sm:rounded-[2rem] blur-2xl pointer-events-none"></div>
          <div className="absolute top-4 sm:top-10 right-4 sm:right-10 w-32 sm:w-40 h-32 sm:h-40 bg-primary/20 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
          <div className="absolute bottom-4 sm:bottom-10 left-4 sm:left-10 w-24 sm:w-32 h-24 sm:h-32 bg-primary/10 rounded-full blur-2xl opacity-30 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 md:space-y-10">
            {/* Title */}
            <div className="space-y-2 sm:space-y-3 max-w-xl px-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Create a QR Code
              </h2>

              <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
                No credit card required. Get started in seconds.
              </p>
            </div>

            {/* Input + Button */}
            <div className="w-full max-w-xl space-y-4 sm:space-y-6 px-2">
              <Label htmlFor="qr-url" className="block space-y-2 sm:space-y-3">
                <span className="font-semibold block text-base sm:text-lg">
                  Enter your QR Code destination
                </span>

                <Input
                  id="qr-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/my-long-url"
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base bg-background/60 backdrop-blur-sm"
                />
              </Label>

              <Button
                size="lg"
                className="w-full py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] sm:hover:scale-[1.03] group text-sm sm:text-base"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="hidden sm:inline">
                  Get your QR Code for free
                </span>
                <span className="sm:hidden">Get QR Code</span>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 sm:mt-16 md:mt-24 text-center px-4">
          <h3 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Sign up for free. Your free plan includes:
          </h3>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-base sm:text-lg">
            {[
              "50 monthly attempts",
              "Unlimited QR Code scans",
              "Visitor analytics & insights",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 sm:gap-4 bg-muted/60 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-border hover:border-primary/50 transition-all hover:scale-105"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                  <Check className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <span className="font-semibold text-sm sm:text-base">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
