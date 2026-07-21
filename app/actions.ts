"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Global single instance to prevent serverless connection exhaustion
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getRoster() {
  try {
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
    const created = await prisma.employee.create({
      data: { name, shifts, hours },
    });
    revalidatePath("/");
    return { success: true, data: created };
  } catch (error: any) {
    console.error("Error creating employee:", error?.message || error);
    return { success: false, error: error?.message };
  }
}

export async function deleteEmployeeFromDb(id: string) {
  try {
    await prisma.employee.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting employee:", error?.message || error);
    return { success: false, error: error?.message };
  }
}