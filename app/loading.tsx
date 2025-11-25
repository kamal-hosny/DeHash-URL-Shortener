import LottieHandler from "@/components/ui/lottie-handler";

const Loading = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-accent/5 to-secondary/10 animate-gradient-shift" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-700" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/15 rounded-full blur-2xl animate-ping"
        style={{ animationDuration: "3s" }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 px-4">
          <LottieHandler
            type="loading"
            message={
              <div className="space-y-2">
                <p className="text-2xl font-semibold text-foreground">
                  Loading your content
                </p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we prepare everything for you
                </p>
              </div>
            }
            width="300px"
            className="h-auto!"
          />

          {/* Loading dots animation */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div
              className="w-3 h-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-3 h-3 bg-accent rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-3 h-3 bg-secondary rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
