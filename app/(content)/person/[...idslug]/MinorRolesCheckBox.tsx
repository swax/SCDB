"use client";

import { Checkbox, FormControlLabel } from "@mui/material";
import { usePathname } from "next/navigation";

export default function MinorRolesCheckBox({ checked }: { checked?: boolean }) {
  // Hooks
  const pathname = usePathname();

  // Event Handlers
  function handleChange_checked(event: React.ChangeEvent<HTMLInputElement>) {
    const hideMinorRoles = event.target.checked;
    const queryQueryParams = hideMinorRoles ? "hideMinorRoles=true" : "";
    window.location.href = `${pathname}?${queryQueryParams}`;
  }

  // Renderinging
  return (
    <FormControlLabel
      label="Hide Minor Roles (No Lines)"
      control={<Checkbox checked={checked} onChange={handleChange_checked} />}
    />
  );
}
