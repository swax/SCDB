import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import {
  getProfile,
  getProfileSketchGrid,
} from "@/backend/user/profileService";
import { getRoleRank } from "@/shared/roleUtils";
import { buildPageTitle } from "@/shared/utilities";
import { user_role_type } from '@/shared/enums';
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { cache } from "react";
import ProfileClientPage from "./page.client";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

const getRequestCachedProfile = cache(async (username: string) =>
  getProfile(username),
);

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const profile = await getRequestCachedProfile(resolvedParams.username);

  return profile
    ? {
        title: buildPageTitle(`${profile.username}'s Profile`),
        description: `The profile for ${profile.username} on SketchTV.lol`,
      }
    : {};
}

export const revalidate = 10;

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions);

  const resolvedParams = await params;
  const profile = await getRequestCachedProfile(resolvedParams.username);

  if (!profile) {
    notFound();
  }

  // Hide mod note from client if user is less than a moderator
  if (
    !session?.user.role ||
    getRoleRank(session.user.role) < getRoleRank(user_role_type.Moderator)
  ) {
    profile.mod_note = null;
  }

  // Sketch grid
  async function getSketchData(page: number) {
    "use server";
    return await getProfileSketchGrid(profile!.id, page);
  }

  const sketchData = await getSketchData(1);

  // Rendering
  return (
    <>
      <ProfileClientPage
        profile={profile}
        sessionRole={session?.user.role}
        sessionUsername={session?.user.username}
        initialSketchData={sketchData}
        getSketchData={getSketchData}
      />
    </>
  );
}
