"use client";

import { useActionState } from "react";
import { loginAction } from "../actions/auth";
import Link from "next/link";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Bug Tracker</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

        <form action={formAction} className={styles.form}>
          {state?.error && <div className={styles.error}>{state.error}</div>}
          
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className={styles.input} 
              required 
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className={styles.input} 
              required 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className={styles.button} disabled={isPending}>
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className={styles.footer}>
          Don't have an account? <Link href="/register" className={styles.link}>Register here</Link>
        </div>
      </div>
    </div>
  );
}
