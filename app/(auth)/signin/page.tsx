import LoginForm from "./signin-form";
import BackButton from "@/components/atoms/back-button";
import Link from "@/components/atoms/link";


const Page = () => {
  return (
    <div className="flex flex-col lg:flex-row h-full text-white">

      {/* Left Section */}
      <div
        className="hidden lg:flex relative flex-1 flex items-end px-6 md:px-12 lg:px-20 pb-8 lg:pb-14 overflow-hidden"
        aria-label="Hero section"
      >
        <div className="absolute top-6 start-6 flex items-center gap-3 z-20">
          <BackButton />
        </div>

        {/* Text Content */}
        <div className="relative space-y-4 lg:space-y-6 z-10">
          <h1 className="text-4xl lg:text-6xl font-semibold leading-tight dark:text-foreground">
            Shorten smarter,
            <br />
            manage links easily
            <br />
            with{" "}
            <span className="bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">
              DeHash
            </span>
          </h1>
          <p className="text-base lg:text-lg dark:text-muted-foreground leading-relaxed max-w-lg">
            DeHash makes it simple and fast to shorten your URLs, track usage,
            manage limits, and stay organized with ease.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-card flex justify-center items-center py-8 lg:py-8">
        <div className="w-full max-w-[400px] px-6">
          
          {/* Mobile Header */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between mb-6">
              <BackButton />

            </div>
            <div className="text-center space-y-2 mb-6">
              <h1 className="text-3xl font-semibold text-foreground">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to continue with DeHash
              </p>
            </div>
          </div>
          
          <div className="hidden lg:block text-center mb-8 lg:mb-10">
            <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to continue managing and shortening your links
              <br />
              with <span className="text-primary font-medium">DeHash</span>
            </p>
          </div>
          {/* OAuth Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 mb-6 lg:mb-8 max-w-md mx-auto">
            {/* GitHub */}
            <button
              type="button"
              className="group relative flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-muted/30 backdrop-blur-md border border-border text-foreground transition-all duration-300 hover:bg-muted hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              <svg
                className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-all"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="font-medium text-sm">GitHub</span>
            </button>

            {/* Google */}
            <button
              type="button"
              className="group relative flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-muted/30 backdrop-blur-md border border-border text-foreground transition-all duration-300 hover:bg-muted hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium text-sm">Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-4 lg:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          {/* Login Form */}
          <LoginForm />

          <div className="mt-6 text-center text-muted-foreground text-sm">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:underline transition-colors"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
