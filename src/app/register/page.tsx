"use client";

import { useActionState } from "react";
import { registerAction } from "../actions/auth";
import Link from "next/link";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Bug Tracker</h1>
        <p className={styles.subtitle}>Create a new account</p>

        <form action={formAction} className={styles.form}>
          {state?.error && <div className={styles.error}>{state.error}</div>}
          
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Name (Optional)</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              className={styles.input} 
              placeholder="John Doe"
            />
          </div>

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
              minLength={6}
            />
          </div>

          <button type="submit" className={styles.button} disabled={isPending}>
            {isPending ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link href="/login" className={styles.link}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
