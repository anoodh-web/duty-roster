"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getRoster() {
  console.log("👉 [1/3] SERVER LOG: Fetching roster from database...");
  try {
    const roster = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
    console.log(`👉 [1/3] SERVER LOG: Successfully fetched ${roster.length} employees.`);

    return roster.map((emp) => ({
      id: emp.id,
      employee: emp.name,
      shifts: (emp.shifts as string[]) || Array(7).fill("Off"),
      hours: (emp.hours as Record<string, string>) || {},
    }));
  } catch (error) {
    console.error("❌ [1/3] SERVER FETCH ERROR:", error);
    return [];
  }
}

export async function addEmployeeToDb(
  name: string,
  shifts: string[],
  hours: Record<string, string>
) {
  console.log("👉 [2/3] SERVER LOG: Attempting to ADD employee:", name);
  try {
    const newEmp = await prisma.employee.create({
      data: {
        name,
        shifts,
        hours,
      },
    });
    console.log("✅ [2/3] SERVER LOG: Successfully saved to Supabase! ID:", newEmp.id);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("❌ [2/3] SERVER ADD ERROR:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteEmployeeFromDb(id: string) {
  console.log("👉 [3/3] SERVER LOG: Attempting to DELETE employee ID:", id);
  try {
    await prisma.employee.delete({
      where: { id },
    });
    console.log("✅ [3/3] SERVER LOG: Successfully deleted from Supabase! ID:", id);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("❌ [3/3] SERVER DELETE ERROR:", error);
    return { success: false, error: String(error) };
  }
}