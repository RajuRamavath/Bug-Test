"use client";

import { useTransition } from "react";
import { updateBugField } from "@/app/actions/bugs";
import styles from "../bugs.module.css";

export function SelectUpdater({ 
  bugId, 
  field, 
  currentValue, 
  options 
}: { 
  bugId: string, 
  field: "status" | "priority" | "assigneeId", 
  currentValue: string,
  options: {value: string, label: string}[]
}) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    startTransition(async () => {
      try {
        await updateBugField(bugId, field, val === "unassigned" ? null : val);
      } catch (err: any) {
        alert(err.message || "Failed to update");
        // We could handle this better but for 6 hours a window.alert on invalid transition is acceptable
      }
    });
  };

  return (
    <select 
      value={currentValue || "unassigned"} 
      onChange={handleChange} 
      disabled={isPending}
      className={styles.select}
      style={{ width: '100%', opacity: isPending ? 0.7 : 1 }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
