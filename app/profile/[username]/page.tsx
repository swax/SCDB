import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import { getChangelog } from "@/backend/changelogService";
import { getProfile } from "@/backend/profileService";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import ProfileClientPage from "./page.client";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const session = await getServerSession(authOptions);

  const profile = await getProfile(params.username, session?.user.role);

  if (!profile) {
    notFound();
  }

  const page = 1;
  const rowsPerPage = 5;

  const changelog = await getChangelog({
    username: params.username,
    page,
    rowsPerPage,
  });

  // Rendering
  return (
    <ProfileClientPage
      profile={profile}
      sessionRole={session?.user.role}
      sessionUsername={session?.user.username}
      changelog={changelog}
      page={page}
      rowsPerPage={rowsPerPage}
    />
  );
}
