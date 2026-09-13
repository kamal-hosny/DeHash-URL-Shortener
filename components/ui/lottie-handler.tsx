"use client";

import Lottie from "lottie-react";
import {
  empty,
  error,
  loading,
  notFound,
  userNotFound,
} from "@/assets/lottieFiles/lottieFiles";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./button";

const lottieFilesMap = {
  empty,
  error,
  loading,
  notFound,
  userNotFound,
} as const;

const defaultMessages = {
  empty: "No data available",
  error: "Something went wrong",
  loading: "Loading...",
  notFound: "Page not found",
  userNotFound: "User not found",
} as const;

type LottieHandlerProps = {
  type: keyof typeof lottieFilesMap;
  message?: string | ReactNode;
  className?: string;
  width?: string;
};

const LottieHandler = ({
  type,
  message,
  className = "",
  width = "400px",
}: LottieHandlerProps) => {
  const router = useRouter();
  const lottie = lottieFilesMap[type];

  const messageStyle =
    type === "error"
      ? "text-lg text-destructive font-semibold"
      : "text-lg text-muted-foreground mt-6";

  const showBackButton = ["error", "notFound", "userNotFound"].includes(type);

  // Get the default message if no custom message is provided
  const displayMessage = message || defaultMessages[type];

  return (
    <div
      className={`flex flex-col items-center justify-center h-screen ${className}`}
    >
      <Lottie
        animationData={lottie}
        style={{ width }}
        loop={type === "loading"}
      />
      <div className="space-y-4 text-center">
        <h3
          className={`text-center text-2xl mt-4 text-text-primary ${messageStyle}`}
        >
          {displayMessage}
        </h3>

        {showBackButton && (
          <Button onClick={() => router.back()}>Go Back</Button>
        )}
      </div>
    </div>
  );
};

export default LottieHandler;
