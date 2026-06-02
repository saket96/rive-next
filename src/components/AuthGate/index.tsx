import React, { type ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/Utils/firebase";
import styles from "./style.module.scss";

type AuthState = "checking" | "signed-in" | "signed-out";

const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH !== "false";
const allowSignup = process.env.NEXT_PUBLIC_ALLOW_SIGNUP === "true";
const privateHomePath = process.env.NEXT_PUBLIC_PRIVATE_HOME_PATH || "/search";

const publicRoutes = new Set(["/login", "/404", "/_offline"]);

const isPublicRoute = (pathname: string) =>
  publicRoutes.has(pathname) || (allowSignup && pathname === "/signup");

const getSafeNextPath = (next?: string | string[]) => {
  if (typeof next === "string" && next.startsWith("/")) return next;
  return privateHomePath;
};

const PrivateAccessMessage = ({
  title,
  message,
  showLoginLink = false,
}: {
  title: string;
  message: string;
  showLoginLink?: boolean;
}) => (
  <main className={styles.authGate}>
    <img src="/images/logo.svg" alt="Rive" />
    <h1>{title}</h1>
    <p>{message}</p>
    {showLoginLink ? <Link href="/login">Go to login</Link> : null}
  </main>
);

const AuthGate = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>("checking");

  const routeIsPublic = useMemo(
    () => isPublicRoute(router.pathname),
    [router.pathname],
  );

  useEffect(() => {
    if (!requireAuth || !router.isReady) return;

    if (router.pathname === "/signup" && !allowSignup) {
      router.replace("/login");
      return;
    }

    if (!isFirebaseConfigured) {
      setAuthState("signed-out");
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (user) {
        setAuthState("signed-in");
        if (router.pathname === "/login" || router.pathname === "/signup") {
          router.replace(getSafeNextPath(router.query.next));
        } else if (router.pathname === "/") {
          router.replace(privateHomePath);
        }
        return;
      }

      setAuthState("signed-out");
      if (!isPublicRoute(router.pathname)) {
        const nextQuery =
          router.asPath === "/"
            ? ""
            : `?next=${encodeURIComponent(router.asPath)}`;
        router.replace(`/login${nextQuery}`);
      }
    });

    return unsubscribe;
  }, [router, routeIsPublic]);

  if (!requireAuth) return <>{children}</>;

  if (!isFirebaseConfigured) {
    return (
      <PrivateAccessMessage
        title="Private access is not configured"
        message="Add your Firebase web app environment variables before deploying this private site."
      />
    );
  }

  if (routeIsPublic && authState !== "signed-in") return <>{children}</>;

  if (authState === "signed-in") return <>{children}</>;

  return (
    <PrivateAccessMessage
      title="Checking private access"
      message="Please wait while Firebase verifies your session."
      showLoginLink={authState === "signed-out"}
    />
  );
};

export default AuthGate;
