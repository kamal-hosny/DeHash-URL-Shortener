"use client";

import NextLink from "next/link";
import React, {
  ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from "react";

type CustomLinkProps = Omit<
  ComponentPropsWithoutRef<typeof NextLink>,
  "children"
> & {
  children: React.ReactNode;
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
    <NextLink href={href} ref={linkRef} prefetch={prefetching} {...rest}>
      {children}
    </NextLink>
  );
};

export default Link;
