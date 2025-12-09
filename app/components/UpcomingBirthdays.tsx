"use client";

import staticUrl from "@/shared/cdnHost";
import CakeIcon from "@mui/icons-material/Cake";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { UpcomingBirthday } from "@/backend/content/homeService";
import AccordionHeader from "./AccordionHeader";

interface UpcomingBirthdaysProps {
  birthdays: UpcomingBirthday[];
}

export default function UpcomingBirthdays({
  birthdays,
}: UpcomingBirthdaysProps) {
  if (!birthdays.length) {
    return null;
  }

  const formatBirthday = (date: Date, isBirthdayToday: boolean) => {
    const dateObj = new Date(date);
    const month = dateObj.toLocaleDateString("en-US", { month: "long" });
    const day = dateObj.getDate();

    if (isBirthdayToday) {
      return `Today! 🎉🎂🎈`;
    }

    return `${month} ${day}`;
  };

  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="birthdays-content"
        id="birthdays-header"
      >
        <AccordionHeader icon={<CakeIcon />}>
          Upcoming Birthdays
        </AccordionHeader>
      </AccordionSummary>
      <AccordionDetails>
        <List sx={{ py: 0 }}>
          {birthdays.map((birthday) => (
            <ListItem
              key={birthday.id}
              component={Link}
              href={`/person/${birthday.id}/${birthday.url_slug}`}
              sx={{
                textDecoration: "none",
                color: "inherit",
                py: 1.5,
                px: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Box sx={{ flex: "0 0 auto", minWidth: { xs: 80, sm: 120 } }}>
                <Typography variant="body1" noWrap>
                  {birthday.name}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 0.5, sm: 1 },
                  flexShrink: 0,
                  justifyContent: "center",
                  flex: 1,
                }}
              >
                {birthday.cast_images.length > 0 ? (
                  birthday.cast_images.map((cdnKey, index) => (
                    <Avatar
                      key={index}
                      src={`${staticUrl}/${cdnKey}`}
                      alt={`${birthday.name} cast ${index + 1}`}
                      sx={{
                        width: { xs: 40, sm: 56 },
                        height: { xs: 40, sm: 56 },
                      }}
                    />
                  ))
                ) : (
                  <Avatar
                    src={
                      birthday.image_cdnkey
                        ? `${staticUrl}/${birthday.image_cdnkey}`
                        : undefined
                    }
                    alt={birthday.name}
                    sx={{
                      width: { xs: 40, sm: 56 },
                      height: { xs: 40, sm: 56 },
                    }}
                  >
                    {!birthday.image_cdnkey && birthday.name.charAt(0)}
                  </Avatar>
                )}
              </Box>
              <Box sx={{ flexShrink: 0, minWidth: { xs: 100, sm: 140 }, textAlign: "right" }}>
                <Typography variant="body2" color="textSecondary">
                  {formatBirthday(birthday.birth_date, birthday.isBirthdayToday)}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
