import DashboardClient from "./DashboardClient";
import { getRoster } from "./actions";

// Keep dynamic rendering active without breaking UI
export const dynamic = "force-dynamic";

export default async function Page() {
  const roster = await getRoster();

  return <DashboardClient initialRoster={roster} />;
}