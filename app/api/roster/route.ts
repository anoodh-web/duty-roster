import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const roster = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = roster.map((emp) => ({
      id: String(emp.id),
      employee: String(emp.name),
      shifts: Array.isArray(emp.shifts) ? emp.shifts : Array(7).fill("Off"),
      hours: typeof emp.hours === "object" && emp.hours !== null ? emp.hours : {},
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("GET Roster Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch roster" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, shifts, hours } = body;

    const created = await prisma.employee.create({
      data: {
        name: String(name),
        shifts: shifts || Array(7).fill("Off"),
        hours: hours || {},
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: String(created.id),
        employee: String(created.name),
        shifts: Array.isArray(created.shifts) ? created.shifts : Array(7).fill("Off"),
        hours: typeof created.hours === "object" && created.hours !== null ? created.hours : {},
      },
    });
  } catch (error: any) {
    console.error("POST Roster Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save to database" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID parameter is required" },
        { status: 400 }
      );
    }

    await prisma.employee.delete({
      where: { id: String(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Roster Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete employee" },
      { status: 500 }
    );
  }
}