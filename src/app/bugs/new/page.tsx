"use client";

import { useActionState } from "react";
import { createBug } from "@/app/actions/bugs";
import Link from "next/link";
import styles from "../bugs.module.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewBugPage() {
  const [state, formAction, isPending] = useActionState(createBug, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.bugId) {
      router.push(`/bugs/${state.bugId}`);
    }
  }, [state, router]);

  return (
    <div className={styles.container} style={{ maxWidth: '600px' }}>
      <div className={styles.header}>
        <h1 className={styles.title}>Report New Bug</h1>
        <Link href="/bugs" className={styles.pageBtn}>Cancel</Link>
      </div>

      <div className={styles.tableContainer} style={{ padding: '2rem' }}>
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {state?.error && (
            <div style={{ background: 'rgba(255, 75, 75, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px' }}>
              {state.error}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="title" style={{ fontWeight: 500 }}>Title <span style={{color: 'var(--danger)'}}>*</span></label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required 
              className={styles.input} 
              placeholder="E.g., Login button doesn't respond on mobile"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="description" style={{ fontWeight: 500 }}>Description</label>
            <textarea 
              id="description" 
              name="description" 
              rows={5} 
              className={styles.input} 
              placeholder="Provide steps to reproduce, expected behavior, and actual behavior..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="priority" style={{ fontWeight: 500 }}>Priority</label>
            <select id="priority" name="priority" className={styles.select}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <button 
            type="submit" 
            className={styles.newButton} 
            disabled={isPending}
            style={{ marginTop: '1rem' }}
          >
            {isPending ? "Creating..." : "Create Bug"}
          </button>
        </form>
      </div>
    </div>
  );
}
