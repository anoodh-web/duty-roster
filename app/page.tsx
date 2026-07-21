import DashboardClient from "./DashboardClient";
import { getRoster } from "./actions";

// Prevent Next.js build analysis from invoking Prisma at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const roster = await getRoster();
  return <DashboardClient initialRoster={roster} />;
}