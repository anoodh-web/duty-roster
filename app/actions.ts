"use server";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

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
      data: {
        name: String(name),
        shifts: shifts || Array(7).fill("Off"),
        hours: hours || {},
      },
    });

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
    console.error("Error creating employee in Supabase:", error?.message || error);
    return { success: false, error: error?.message || "Failed to save to database" };
  }
}

export async function deleteEmployeeFromDb(id: string) {
  try {
    await prisma.employee.delete({
      where: { id: String(id) },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting employee:", error?.message || error);
    return { success: false, error: error?.message || "Failed to delete employee" };
  }
}