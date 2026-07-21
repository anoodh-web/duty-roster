import DashboardClient from "./DashboardClient";
import { getRoster } from "./actions";

// Tell Next.js not to compile this page statically during build time
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Page() {
  const roster = await getRoster();

  return <DashboardClient initialRoster={roster} />;
}