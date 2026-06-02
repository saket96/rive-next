import React, { useState } from "react";
import styles from "@/styles/Settings.module.scss";
import Link from "next/link";
import { loginUserGoogle, loginUserManual } from "@/Utils/firebaseUser";
import { useRouter } from "next/router";

const allowSignup = process.env.NEXT_PUBLIC_ALLOW_SIGNUP === "true";
const allowGoogleSignIn =
  process.env.NEXT_PUBLIC_ALLOW_GOOGLE_SIGNIN === "true";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Private Rive";
const siteTagline = process.env.NEXT_PUBLIC_SITE_TAGLINE || "Personal use only";
const privateHomePath = process.env.NEXT_PUBLIC_PRIVATE_HOME_PATH || "/search";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { push, query } = useRouter();

  const getNextPath = () => {
    if (typeof query.next === "string" && query.next.startsWith("/")) {
      return query.next;
    }
    return privateHomePath;
  };

  const handleFormSubmission = async (e: any) => {
    e.preventDefault();
    if (await loginUserManual({ email, password })) {
      push(getNextPath());
    }
  };

  const handleGoogleSignIn = async (e: any) => {
    e.preventDefault();
    if (await loginUserGoogle()) {
      push(getNextPath());
    }
  };

  return (
    <div className={`${styles.settingsPage} ${styles.authPage}`}>
      <div className={styles.logo}>
        <img
          src="/images/logo.svg"
          alt="logo"
          data-tooltip-id="tooltip"
          data-tooltip-content="Rive"
        />
        <p>{siteTagline}</p>
      </div>
      <div className={styles.settings}>
        <h1>{siteName}</h1>
        <p className={styles.privateNote}>
          Enter the private Firebase email/password created by the site owner.
        </p>
        <div className={styles.group2}>
          <>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button onClick={handleFormSubmission}>Login</button>
          </>
        </div>
        {allowGoogleSignIn ? (
          <h4 className={styles.signin} onClick={handleGoogleSignIn}>
            Sign in with <span className={styles.highlight}>Google</span>
          </h4>
        ) : null}
        {allowSignup ? (
          <h4>
            Need access?{" "}
            <Link href="/signup" className={styles.highlight}>
              Signup
            </Link>
          </h4>
        ) : (
          <h4 className={styles.privateNote}>
            Public signup is disabled. Create users in Firebase Console for a
            private, ad-free deployment.
          </h4>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
