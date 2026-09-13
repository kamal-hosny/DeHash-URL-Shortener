"use client";

import Link from "@/components/ui/Link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-linear-to-br from-muted/30 via-background to-muted/20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-10" />

      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 size-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 size-80 bg-accent/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-12">
            <div className="text-center space-y-8">
              {/* 404 Number */}
              <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent to-secondary">
                404
              </h1>

              {/* Title + Description */}
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Page Not Found
                </h2>
                <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                  The page you&rsquo;re looking for doesn&rsquo;t exist or has
                  been moved.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="size-5" />
                    Back to Home
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Link
                    href="#"
                    onClick={() => history.back()}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="size-5" />
                    Go Back
                  </Link>
                </Button>
              </div>

              {/* Help text */}
              <div className="pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Need help?{" "}
                  <Link
                    href="/contact"
                    className="text-primary hover:text-primary/80 underline-offset-4 font-medium transition-colors"
                  >
                    Contact us
                  </Link>{" "}
                  or return to our{" "}
                  <Link
                    href="/"
                    className="text-primary hover:text-primary/80 underline-offset-4 font-medium transition-colors"
                  >
                    homepage
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
