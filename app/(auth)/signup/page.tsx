import SignupForm from "./signup-form";
import BackButton from "@/components/atoms/BackButton";
import Link from "@/components/atoms/Link";
import ThemeModeButton from "@/components/atoms/ModeToggle";
import OAuthButtons from "../oauth-buttons";

export default function SignupPage() {
  return (
    <div className="flex flex-col lg:flex-row h-full text-white">
      {/* Left Section */}
      <div className="hidden lg:flex relative flex-1 items-end px-6 md:px-12 lg:px-20 pb-8 lg:pb-14">
        {/* Buttons */}
        <div className="absolute top-6 end-6 flex items-center gap-3 z-20">
          <ThemeModeButton />
        </div>
        <div className="absolute top-6 start-6 flex items-center gap-3 z-20">
          <BackButton />
        </div>

        {/* Text */}
        <div className="relative space-y-4 lg:space-y-6 z-10">
          <h1 className="text-4xl lg:text-6xl font-semibold leading-tight">
            Create your account
            <br />
            and start shortening
            <br />
            with{" "}
            <span className="bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">
              DeHash
            </span>
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground max-w-lg">
            Join thousands of users using DeHash to shorten, manage, and secure
            their links.
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
              <ThemeModeButton />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-semibold text-foreground">
                Create your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Join thousands of users using DeHash
              </p>
            </div>
          </div>

          <div className="hidden lg:block text-center mb-8 lg:mb-10">
            <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-2">
              Create your account
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign up to get started with{" "}
              <span className="text-primary font-medium">DeHash</span>
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

          <SignupForm />

          {/* Switch to login */}
          <div className="mt-6 text-center text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
