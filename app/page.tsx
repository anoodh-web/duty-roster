import DashboardClient from "./DashboardClient";
import { getRoster } from "./actions";

// Tell Next.js 15 to NEVER evaluate or pre-render this page at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Page() {
  let initialData = [];

  try {
    initialData = await getRoster();
  } catch (error) {
    console.error("Failed to load initial roster on server render:", error);
  }

  return <DashboardClient initialRoster={initialData} />;
}