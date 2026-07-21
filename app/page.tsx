import DashboardClient from "./DashboardClient";
import { getRoster } from "./actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const roster = await getRoster();
  return <DashboardClient initialRoster={roster} />;
}