import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const filters = ["All", "Placement", "Result", "Event"];

/**
 * Filter Toggle buttons to filter notifications by Type.
 */
export function NotificationFilter({ value, onChange }) {
  const handleChange = (event, nextValue) => {
    // Prevent deselecting (MUI exclusive returns null when active item is clicked again)
    if (nextValue !== null) {
      onChange(nextValue);
    }
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      size="small"
      sx={{
        flexWrap: "wrap",
        gap: 0.5,
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        p: 0.5,
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        "& .MuiToggleButtonGroup-grouped": {
          border: 0,
          borderRadius: "6px !important",
          mx: 0.25,
          color: "rgba(255, 255, 255, 0.6)",
          textTransform: "none",
          fontWeight: 600,
          px: 2.5,
          "&.Mui-selected": {
            backgroundColor: "primary.main",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          },
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.08)",
          },
        },
      }}
    >
      {filters.map((type) => (
        <ToggleButton key={type} value={type}>
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}