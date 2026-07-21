import DashboardClient from "./DashboardClient";
import { getRoster } from "./actions";

// ⚠️ THESE TWO LINES FIX THE 405 METHOD NOT ALLOWED ERROR
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const roster = await getRoster();

  return <DashboardClient initialRoster={roster} />;
}