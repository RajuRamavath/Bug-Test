import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "./bugs.module.css";
import { Prisma } from "@prisma/client";

export default async function BugsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  const q = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "";
  const priority = typeof params.priority === "string" ? params.priority : "";
  const sort = typeof params.sort === "string" ? params.sort : "updatedAt:desc";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const pageSize = 5;

  // Build where clause
  const where: Prisma.BugWhereInput = {};
  if (q) {
    where.title = { contains: q };
  }
  if (status) {
    where.status = status;
  }
  if (priority) {
    where.priority = priority;
  }

  // Build order by
  const [sortFieldRaw, sortDir] = sort.split(":");
  const sortField = sortFieldRaw === "priority" ? "priorityWeight" : sortFieldRaw;
  const orderBy: Prisma.BugOrderByWithRelationInput = {
    [sortField]: sortDir as Prisma.SortOrder,
  };

  const [bugs, total] = await Promise.all([
    prisma.bug.findMany({
      where,
      orderBy,
      include: {
        assignee: { select: { name: true, email: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.bug.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const getStatusClass = (s: string) => {
    switch (s) {
      case 'Open': return styles.statusOpen;
      case 'In Progress': return styles.statusInProgress;
      case 'Resolved': return styles.statusResolved;
      case 'Closed': return styles.statusClosed;
      default: return '';
    }
  };

  const getPriorityClass = (p: string) => {
    switch (p) {
      case 'Low': return styles.priorityLow;
      case 'Medium': return styles.priorityMedium;
      case 'High': return styles.priorityHigh;
      case 'Critical': return styles.priorityCritical;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>All Bugs</h1>
        <Link href="/bugs/new" className={styles.newButton}>
          + New Bug
        </Link>
      </div>

      <form className={styles.controls} method="GET">
        <input 
          type="text" 
          name="q" 
          defaultValue={q} 
          placeholder="Search bugs..." 
          className={styles.input}
        />
        <select name="status" defaultValue={status} className={styles.select}>
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select name="priority" defaultValue={priority} className={styles.select}>
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
        <select name="sort" defaultValue={sort} className={styles.select}>
          <option value="updatedAt:desc">Recently Updated</option>
          <option value="updatedAt:asc">Oldest Updated</option>
          <option value="createdAt:desc">Newest Created</option>
          <option value="createdAt:asc">Oldest Created</option>
          <option value="priority:desc">Priority (High to Low)</option>
          <option value="priority:asc">Priority (Low to High)</option>
        </select>
        <button type="submit" className={styles.pageBtn} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none' }}>
          Apply Filters
        </button>
        {(q || status || priority) && (
          <Link href="/bugs" className={styles.pageBtn} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            Clear
          </Link>
        )}
      </form>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Title</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Priority</th>
              <th className={styles.th}>Assignee</th>
              <th className={styles.th}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {bugs.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.td} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No bugs found.
                </td>
              </tr>
            ) : bugs.map((bug) => (
              <tr key={bug.id} className={styles.tr}>
                <td className={styles.td}>
                  <Link href={`/bugs/${bug.id}`} style={{ fontWeight: 600 }}>
                    {bug.title}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    #{bug.id.split('-')[0]}
                  </div>
                </td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${getStatusClass(bug.status)}`}>
                    {bug.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <span className={getPriorityClass(bug.priority)}>
                    {bug.priority}
                  </span>
                </td>
                <td className={styles.td}>
                  {bug.assignee ? bug.assignee.name || bug.assignee.email : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                </td>
                <td className={styles.td} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {bug.updatedAt.toLocaleString(undefined, { 
                    year: 'numeric', month: 'short', day: 'numeric', 
                    hour: '2-digit', minute: '2-digit'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Link 
            href={`/bugs?q=${q}&status=${status}&priority=${priority}&sort=${sort}&page=${page > 1 ? page - 1 : 1}`}
            className={styles.pageBtn}
            style={{ pointerEvents: page <= 1 ? 'none' : 'auto', opacity: page <= 1 ? 0.5 : 1 }}
          >
            Previous
          </Link>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </span>
          <Link 
            href={`/bugs?q=${q}&status=${status}&priority=${priority}&sort=${sort}&page=${page < totalPages ? page + 1 : totalPages}`}
            className={styles.pageBtn}
            style={{ pointerEvents: page >= totalPages ? 'none' : 'auto', opacity: page >= totalPages ? 0.5 : 1 }}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
