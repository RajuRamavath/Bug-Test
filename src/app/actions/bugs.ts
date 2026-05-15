"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const bugSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
  assigneeId: z.string().optional(),
});

export async function createBug(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const data = Object.fromEntries(formData);
  const result = bugSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { title, description, priority, assigneeId } = result.data;

  try {
    const bug = await prisma.bug.create({
      data: {
        title,
        description,
        priority,
        reporterId: session.userId,
        assigneeId: assigneeId || null,
      },
    });

    await prisma.activity.create({
      data: {
        action: "created",
        description: "Bug created",
        actorId: session.userId,
        bugId: bug.id,
      },
    });
    
    // Redirect must be outside the try-catch or next.js will swallow it, wait actually Next.js handles it if you throw redirect
    return { success: true, bugId: bug.id };
  } catch (e) {
    return { error: "Failed to create bug" };
  }
}

export async function updateBugField(bugId: string, field: "status" | "priority" | "assigneeId", value: string | null) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const bug = await prisma.bug.findUnique({ where: { id: bugId } });
  if (!bug) throw new Error("Bug not found");

  const oldVal = bug[field];
  if (oldVal === value) return { success: true };

  // Status transitions validation
  if (field === "status") {
    const allowedTransitions: Record<string, string[]> = {
      "Open": ["In Progress"],
      "In Progress": ["Resolved"],
      "Resolved": ["Closed", "Open"],
      "Closed": ["Open"],
    };
    if (!allowedTransitions[bug.status]?.includes(value as string)) {
      throw new Error(`Invalid status transition from ${bug.status} to ${value}`);
    }
  }

  await prisma.bug.update({
    where: { id: bugId },
    data: { [field]: value },
  });

  const actionMap: Record<string, string> = {
    "status": "status_change",
    "priority": "priority_change",
    "assigneeId": "assignee_change"
  };

  await prisma.activity.create({
    data: {
      action: actionMap[field],
      description: `Changed ${field} from ${oldVal || 'None'} to ${value || 'None'}`,
      actorId: session.userId,
      bugId: bug.id,
    },
  });

  revalidatePath(`/bugs/${bugId}`);
  revalidatePath(`/bugs`);
  return { success: true };
}

export async function addComment(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const body = formData.get("body")?.toString().trim();
  const bugId = formData.get("bugId")?.toString();

  if (!body) return { error: "Comment cannot be empty" };
  if (!bugId) return { error: "Bug ID missing" };

  try {
    await prisma.comment.create({
      data: {
        body,
        authorId: session.userId,
        bugId,
      },
    });

    await prisma.activity.create({
      data: {
        action: "comment_added",
        description: "Added a comment",
        actorId: session.userId,
        bugId,
      },
    });

    revalidatePath(`/bugs/${bugId}`);
    return { success: true, resetKey: Date.now() };
  } catch (e) {
    return { error: "Failed to add comment" };
  }
}

export async function deleteBug(bugId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.bug.delete({ where: { id: bugId } });
  
  revalidatePath("/bugs");
  redirect("/bugs");
}
