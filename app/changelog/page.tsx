import { getChangelog } from "@/backend/changelogService";
import ChangeLogTable from "@/frontend/hooks/ChangeLogTable";

export default async function Changelog() {
  const changelog = await getChangelog();

  return (
    <div>
      <h1>Changelog</h1>
      <ChangeLogTable changelog={changelog} />
    </div>
  );
}
