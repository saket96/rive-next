import React, { useState } from "react";
import styles from "@/styles/Settings.module.scss";
import Link from "next/link";
import { signupUserManual } from "@/Utils/firebaseUser";
import { useRouter } from "next/navigation";

const allowSignup = process.env.NEXT_PUBLIC_ALLOW_SIGNUP === "true";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { push } = useRouter();

  const handleFormSubmission = async (e: any) => {
    e.preventDefault();
    if (await signupUserManual({ username, email, password })) {
      push("/settings");
    }
  };

  if (!allowSignup) {
    return (
      <div className={`${styles.settingsPage} ${styles.authPage}`}>
        <div className={styles.logo}>
          <img src="/images/logo.svg" alt="logo" />
          <p>Private Streaming Oasis</p>
        </div>
        <div className={styles.settings}>
          <h1>Signup disabled</h1>
          <p className={styles.privateNote}>
            This deployment is private. Create email/password users in Firebase
            Console, then share those credentials only with allowed viewers.
          </p>
          <Link href="/login" className={styles.highlight}>
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.settingsPage} ${styles.authPage}`}>
      <div className={styles.logo}>
        <img
          src="/images/logo.svg"
          alt="logo"
          data-tooltip-id="tooltip"
          data-tooltip-content="Rive"
        />
        <p>Your Personal Streaming Oasis</p>
      </div>
      <div className={styles.settings}>
        <h1>Signup</h1>
        <div className={styles.group2}>
          <>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e: any) => setUsername(e.target.value)}
              required
            />
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              required
            />
            <button onClick={handleFormSubmission}>submit</button>
          </>
        </div>
        <h4>
          Already a Rive member!{" "}
          <Link href="/login" className={styles.highlight}>
            Login
          </Link>
        </h4>
      </div>
    </div>
  );
};

export default SignupPage;
