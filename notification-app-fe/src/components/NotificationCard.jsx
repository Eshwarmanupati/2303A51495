import React from "react";
import { Card, CardContent, Typography, Box, Chip, Stack } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { getPriorityScore } from "../hooks/useNotifications";

/**
 * Maps notification types to beautiful gradient colors and icons.
 */
const TYPE_CONFIG = {
  Placement: {
    gradient: "linear-gradient(135deg, rgba(255, 75, 75, 0.15) 0%, rgba(255, 120, 75, 0.05) 100%)",
    border: "rgba(255, 75, 75, 0.4)",
    color: "#ff4b4b",
    icon: <WorkIcon sx={{ color: "#ff4b4b" }} />,
    bg: "rgba(255, 75, 75, 0.1)",
  },
  Result: {
    gradient: "linear-gradient(135deg, rgba(255, 180, 0, 0.15) 0%, rgba(255, 210, 0, 0.05) 100%)",
    border: "rgba(255, 180, 0, 0.4)",
    color: "#ffb400",
    icon: <SchoolIcon sx={{ color: "#ffb400" }} />,
    bg: "rgba(255, 180, 0, 0.1)",
  },
  Event: {
    gradient: "linear-gradient(135deg, rgba(0, 180, 255, 0.15) 0%, rgba(0, 220, 255, 0.05) 100%)",
    border: "rgba(0, 180, 255, 0.4)",
    color: "#00b4ff",
    icon: <EventIcon sx={{ color: "#00b4ff" }} />,
    bg: "rgba(0, 180, 255, 0.1)",
  },
};

const DEFAULT_CONFIG = {
  gradient: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
  border: "rgba(255, 255, 255, 0.1)",
  color: "#ffffff",
  icon: <NotificationsActiveIcon sx={{ color: "#ffffff" }} />,
  bg: "rgba(255, 255, 255, 0.05)",
};

/**
 * A visually stunning Glassmorphic notification card.
 */
export function NotificationCard({ notification }) {
  const { Type, Message, Timestamp, ID } = notification;
  const score = getPriorityScore(Type);
  const config = TYPE_CONFIG[Type] || DEFAULT_CONFIG;

  // Format date/time nicely
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card
      sx={{
        background: config.gradient,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${config.border}`,
        borderRadius: "12px",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 8px 30px ${config.border}`,
          borderColor: config.color,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
          {/* Circular Icon Container */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor: config.bg,
              border: `1px solid ${config.border}`,
              flexShrink: 0,
            }}
          >
            {config.icon}
          </Box>

          {/* Main details */}
          <Box sx={{ flexGrow: 1, width: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} mb={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={Type}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    backgroundColor: config.bg,
                    color: config.color,
                    border: `1px solid ${config.border}`,
                    borderRadius: "6px",
                  }}
                />
                <Chip
                  label={`Priority Score: ${score}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "rgba(255, 255, 255, 0.7)",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                  }}
                />
              </Stack>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.4)", fontWeight: 500 }}>
                {formatDate(Timestamp)}
              </Typography>
            </Stack>

            <Typography variant="body1" sx={{ color: "#ffffff", fontWeight: 500, lineHeight: 1.5 }}>
              {Message}
            </Typography>

            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.2)", display: "block", mt: 0.5, fontFamily: "monospace" }}>
              ID: {ID}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
