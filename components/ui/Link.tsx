"use client";

import NextLink from "next/link";
import type { Route } from "next";
import React, {
  ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from "react";

type CustomLinkProps<T extends string = string> = Omit<
  ComponentPropsWithoutRef<typeof NextLink>,
  "children" | "href"
> & {
  children: React.ReactNode;
  href: Route<T> | string;
};

const Link: React.FC<CustomLinkProps> = ({ children, href, ...rest }) => {
  const [prefetching, setPrefetching] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const setPrefetchListener = () => {
    setPrefetching(true);
  };

  const removePrefetchListener = () => {
    setPrefetching(false);
  };

  useEffect(() => {
    const linkElement = linkRef.current;
    linkElement?.addEventListener("mouseover", setPrefetchListener);
    linkElement?.addEventListener("mouseleave", removePrefetchListener);
    return () => {
      linkElement?.removeEventListener("mouseover", setPrefetchListener);
      linkElement?.removeEventListener("mouseleave", removePrefetchListener);
    };
  }, []);

  return (
    <NextLink
      href={href as Route}
      ref={linkRef}
      prefetch={prefetching}
      {...rest}
    >
      {children}
    </NextLink>
  );
};

export default Link;