import DashboardClient from "./DashboardClient";
import { getRoster } from "./actions";

// Force Next.js to evaluate this route dynamically at runtime, never at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  let initialRoster = [];

  try {
    initialRoster = await getRoster();
  } catch (error) {
    console.error("Build-time roster fallback:", error);
  }

  return <DashboardClient initialRoster={initialRoster} />;
}