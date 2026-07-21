// app/actions.ts
"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
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
    console.error("❌ Database Fetch Error:", error);
    return [];
  }
}

export async function addEmployeeToDb(
  name: string,
  shifts: string[],
  hours: Record<string, string>
) {
  try {
    await prisma.employee.create({
      data: {
        name,
        shifts,
        hours,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("❌ Add Error:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteEmployeeFromDb(id: string) {
  try {
    await prisma.employee.delete({
      where: { id },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("❌ Delete Error:", error);
    return { success: false, error: String(error) };
  }
}