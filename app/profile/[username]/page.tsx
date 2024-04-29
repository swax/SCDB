import { getProfile } from "@/backend/profileService";
import ChangeLogTable from "@/frontend/hooks/ChangeLogTable";
import { notFound } from "next/navigation";
import { getChangelog } from "@/backend/changelogService";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const profile = await getProfile(params.username);

  if (!profile) {
    notFound();
  }

  const changelog = await getChangelog(profile.id);

  // TODO: Show change log only if logged in

  // Rendering
  return (
    <div>
      <h1>{params.username}</h1>
      <ChangeLogTable changelog={changelog} />;
    </div>
  );
}
