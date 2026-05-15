"use server";

import { z } from "zod";
import { hashPassword, verifyPassword, setSession, clearSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

export async function registerAction(prevState: any, formData: FormData) {
  const result = authSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password, name } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Email already in use" };
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        passwordHash: hashedPassword,
      },
    });

    await setSession(user.id, user.email);
  } catch (e) {
    return { error: "Something went wrong during registration" };
  }

  redirect("/bugs");
}

export async function loginAction(prevState: any, formData: FormData) {
  const result = authSchema.omit({ name: true }).safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "Invalid email or password" };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: "Invalid email or password" };
    }

    await setSession(user.id, user.email);
  } catch (e) {
    return { error: "Something went wrong during login" };
  }

  redirect("/bugs");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
