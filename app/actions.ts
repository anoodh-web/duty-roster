"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Helper function to lazily initialize Prisma Client only when called
function getPrisma() {
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

export async function getRoster() {
  try {
    const prisma = getPrisma();
    const roster = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });

    return roster.map((emp) => ({
      id: emp.id,
      employee: emp.name,
      shifts: (emp.shifts as string[]) || Array(7).fill("Off"),
      hours: (emp.hours as Record<string, string>) || {},
    }));
  } catch (error) {
    console.error("Failed to fetch roster:", error);
    return [];
  }
}

export async function addEmployeeToDb(
  name: string,
  shifts: string[],
  hours: Record<string, string>
) {
  try {
    const prisma = getPrisma();
    const created = await prisma.employee.create({
      data: { name, shifts, hours },
    });
    revalidatePath("/");
    return { success: true, data: created };
  } catch (error) {
    console.error("Error creating employee:", error);
    return { success: false };
  }
}

export async function deleteEmployeeFromDb(id: string) {
  try {
    const prisma = getPrisma();
    await prisma.employee.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting employee:", error);
    return { success: false };
  }
}