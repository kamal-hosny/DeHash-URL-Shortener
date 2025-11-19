import LoginForm from "./signin-form";
import BackButton from "@/components/atoms/back-button";
import Link from "@/components/atoms/link";
import OAuthButtons from "./oauth-buttons";

const Page = () => {
  return (
    <div className="flex flex-col lg:flex-row h-full text-white">

      {/* Left Section */}
      <div
        className="hidden lg:flex relative flex-1  items-end px-6 md:px-12 lg:px-20 pb-8 lg:pb-14 overflow-hidden"
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
          <OAuthButtons />

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
