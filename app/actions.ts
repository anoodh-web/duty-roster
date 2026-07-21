"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

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

    // Explicitly map object values to pure JSON primitives
    return roster.map((emp) => ({
      id: String(emp.id),
      employee: String(emp.name),
      shifts: Array.isArray(emp.shifts) ? emp.shifts : Array(7).fill("Off"),
      hours: typeof emp.hours === "object" && emp.hours !== null ? emp.hours : {},
    }));
  } catch (error: any) {
    console.error("Failed to fetch roster:", error?.message || error);
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
    return {
      success: true,
      data: {
        id: String(created.id),
        employee: String(created.name),
        shifts: Array.isArray(created.shifts) ? created.shifts : Array(7).fill("Off"),
        hours: typeof created.hours === "object" && created.hours !== null ? created.hours : {},
      },
    };
  } catch (error: any) {
    console.error("Error creating employee:", error?.message || error);
    return { success: false, error: error?.message || "Failed to create employee" };
  }
}

export async function deleteEmployeeFromDb(id: string) {
  try {
    await prisma.employee.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting employee:", error?.message || error);
    return { success: false, error: error?.message || "Failed to delete employee" };
  }
}