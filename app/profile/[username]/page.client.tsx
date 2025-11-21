"use client";

import SketchGrid from "@/app/(content)/SketchGrid";
import { GetProfileResponse } from "@/backend/user/profileService";
import { allowedToChangeRole } from "@/shared/roleUtils";
import { SketchGridData } from "@/shared/sketchGridBase";
import { Box, Typography } from "@mui/material";
import { user_role_type } from '@/shared/enums';
import ChangeLog from "./ChangeLog";
import EditActivity from "./EditActivity";
import ModPanel from "./ModPanel";

interface ProfileClientPageProps {
  profile: GetProfileResponse;
  sessionUsername?: string;
  sessionRole?: user_role_type;
  initialSketchData: SketchGridData;
  getSketchData: (page: number) => Promise<SketchGridData>;
}

export default function ProfileClientPage({
  profile,
  sessionRole,
  sessionUsername,
  initialSketchData,
  getSketchData,
}: ProfileClientPageProps) {
  // Constants
  const showModOptions =
    sessionRole &&
    sessionUsername &&
    sessionUsername !== profile.username &&
    allowedToChangeRole(profile.role, sessionRole);

  // Rendering
  return (
    <Box>
      <Box style={{ marginTop: 32, marginBottom: 32 }}>
        <Typography component="h1" variant="h4">
          {profile.username}
        </Typography>
        <Typography component="div" variant="subtitle1">
          Role: {profile.role}
        </Typography>
      </Box>

      <SketchGrid
        initialData={initialSketchData}
        getData={getSketchData}
        title="Rated Sketches"
      />

      <EditActivity userId={profile.id} />

      {showModOptions && <ModPanel profile={profile} />}

      <ChangeLog username={profile.username} />
    </Box>
  );
}
