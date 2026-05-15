import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import styles from "../bugs.module.css";
import Link from "next/link";
import { SelectUpdater } from "./FieldUpdater";
import { addComment, deleteBug } from "@/app/actions/bugs";

export default async function BugDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bug = await prisma.bug.findUnique({
    where: { id },
    include: {
      reporter: { select: { name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      comments: { 
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'asc' }
      },
      activities: {
        include: { actor: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!bug) {
    notFound();
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' }
  });

  const assigneeOptions = [
    { value: "unassigned", label: "Unassigned" },
    ...users.map(u => ({ value: u.id, label: u.name || u.email }))
  ];

  const statusOptions = [
    { value: "Open", label: "Open" },
    { value: "In Progress", label: "In Progress" },
    { value: "Resolved", label: "Resolved" },
    { value: "Closed", label: "Closed" }
  ];

  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Critical", label: "Critical" }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Link href="/bugs" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'inline-block' }}>
            &larr; Back to Bugs
          </Link>
          <h1 className={styles.title}>{bug.title}</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Reported by {bug.reporter.name || bug.reporter.email} on {bug.createdAt.toLocaleString()}
          </div>
        </div>
        
        <form action={async () => {
          "use server";
          await deleteBug(bug.id);
        }}>
          <button type="submit" className={styles.pageBtn} style={{ color: 'var(--danger)', borderColor: 'rgba(255, 75, 75, 0.3)' }}>
            Delete Bug
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Description */}
          <div className={styles.tableContainer} style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Description</h3>
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)', lineHeight: 1.6 }}>
              {bug.description || <span style={{ color: 'var(--text-muted)' }}>No description provided.</span>}
            </div>
          </div>

          {/* Comments */}
          <div className={styles.tableContainer} style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Comments ({bug.comments.length})</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              {bug.comments.map(c => (
                <div key={c.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{c.author.name || c.author.email}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{c.createdAt.toLocaleString()}</span>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{c.body}</div>
                </div>
              ))}
              {bug.comments.length === 0 && (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No comments yet.</div>
              )}
            </div>

            <form action={async (formData) => {
              "use server";
              await addComment(null, formData);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="hidden" name="bugId" value={bug.id} />
              <textarea 
                name="body" 
                className={styles.input} 
                rows={3} 
                placeholder="Add a comment..."
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className={styles.newButton} style={{ padding: '0.5rem 1rem' }}>
                  Post Comment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className={styles.tableContainer} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>STATUS</div>
              <SelectUpdater bugId={bug.id} field="status" currentValue={bug.status} options={statusOptions} />
            </div>
            
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>PRIORITY</div>
              <SelectUpdater bugId={bug.id} field="priority" currentValue={bug.priority} options={priorityOptions} />
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>ASSIGNEE</div>
              <SelectUpdater bugId={bug.id} field="assigneeId" currentValue={bug.assigneeId || "unassigned"} options={assigneeOptions} />
            </div>
          </div>

          <div className={styles.tableContainer} style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', fontSize: '1rem' }}>Activity Log</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
              {bug.activities.map(a => (
                <div key={a.id} style={{ fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-secondary)', marginTop: '0.4rem', flexShrink: 0 }} />
                  <div>
                    <div>
                      <span style={{ fontWeight: 600 }}>{a.actor.name || a.actor.email}</span> {a.description}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                      {a.createdAt.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
