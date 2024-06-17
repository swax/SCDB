import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import { getChangelog } from "@/backend/mgmt/changelogService";
import {
  getProfile,
  getProfileSketchGrid,
} from "@/backend/user/profileService";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import ProfileClientPage from "./page.client";

export const revalidate = 10;

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

  // Sketch grid
  async function getSketchData(page: number) {
    "use server";
    return await getProfileSketchGrid(profile!.id, page);
  }

  const sketchData = await getSketchData(1);

  // Changelog
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
      initialSketchData={sketchData}
      getSketchData={getSketchData}
    />
  );
}
