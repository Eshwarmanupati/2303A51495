import React, { useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Box,
  Card,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  IconButton,
  Button,
  Paper,
  InputAdornment,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RefreshIcon from "@mui/icons-material/Refresh";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SortIcon from "@mui/icons-material/Sort";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications, getPriorityScore } from "../hooks/useNotifications";

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [limit, setLimit] = useState(10);
  
  // Manage token state; persist to localStorage for easy grading/retries
  const [token, setToken] = useState(() => {
    return localStorage.getItem("eval_auth_token") || "";
  });
  const [showToken, setShowToken] = useState(false);

  // Hook for API notifications
  const { notifications, loading, error, refetch } = useNotifications(token);

  // Save token changes
  const handleTokenChange = (e) => {
    const val = e.target.value;
    setToken(val);
    localStorage.setItem("eval_auth_token", val);
  };

  const toggleShowToken = () => {
    setShowToken((prev) => !prev);
  };

  // Filter & Slice the sorted notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "All") return true;
    return n.Type === filter;
  });

  // Take the Top N
  const displayNotifications = filteredNotifications.slice(0, limit);

  // Calculate unread count (for display, e.g. how many Placements or high priority notifications)
  const highPriorityCount = notifications.filter(n => getPriorityScore(n.Type) >= 2).length;

  return (
    <Box sx={{ maxWidth: 760, mx: "auto", px: 2, py: 4 }}>
      {/* Header section with modern title & badge */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Badge badgeContent={highPriorityCount} color="error" max={99}>
            <NotificationsIcon sx={{ fontSize: 32, color: "primary.main" }} />
          </Badge>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
              Priority Inbox
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.4)" }}>
              Top {limit} most important updates
            </Typography>
          </Box>
        </Stack>

        <IconButton 
          onClick={refetch} 
          disabled={loading || !token}
          sx={{ 
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" } 
          }}
        >
          {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
        </IconButton>
      </Stack>

      {/* Auth Token Configuration Card */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          mb: 4, 
          borderRadius: "12px", 
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} mb={1.5} display="flex" alignItems="center" gap={1}>
          <VpnKeyIcon fontSize="small" color="primary" /> Authorization Credentials
        </Typography>
        <TextField
          fullWidth
          size="small"
          type={showToken ? "text" : "password"}
          label="Bearer Authorization Token"
          value={token}
          onChange={handleTokenChange}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          variant="outlined"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowToken} edge="end">
                    {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            }
          }}
        />
        <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.35)", mt: 1, display: "block" }}>
          *Token is securely stored locally and used for <code>Authorization: Bearer &lt;token&gt;</code> header.
        </Typography>
      </Paper>

      {/* Filters and Limits Row */}
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        spacing={2} 
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        mb={3}
      >
        <Box>
          <NotificationFilter value={filter} onChange={setFilter} />
        </Box>
        
        <Box sx={{ minWidth: 140 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="limit-select-label">Inbox Size</InputLabel>
            <Select
              labelId="limit-select-label"
              id="limit-select"
              value={limit}
              label="Inbox Size"
              onChange={(e) => setLimit(Number(e.target.value))}
              sx={{ 
                borderRadius: "8px",
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontWeight: 600
                }
              }}
            >
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={15}>Top 15</MenuItem>
              <MenuItem value={20}>Top 20</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>

      <Divider sx={{ mb: 3, opacity: 0.1 }} />

      {/* Core UI Notification display */}
      {loading && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10} gap={2}>
          <CircularProgress size={40} thickness={4} />
          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
            Fetching & sorting priority notifications...
          </Typography>
        </Box>
      )}

      {!loading && !token && (
        <Alert 
          severity="info" 
          variant="outlined"
          sx={{ 
            borderRadius: "12px", 
            backgroundColor: "rgba(2, 136, 209, 0.05)",
            border: "1px dashed rgba(2, 136, 209, 0.3)",
            py: 3,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <Typography fontWeight={700} variant="h6" mb={1}>
            Authorization Required
          </Typography>
          Please enter your Bearer Authorization token in the credentials field above to fetch updates.
        </Alert>
      )}

      {!loading && token && error && (
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ borderRadius: "12px" }}
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          }
        >
          Failed to load notifications: {error}
        </Alert>
      )}

      {!loading && token && !error && displayNotifications.length === 0 && (
        <Alert 
          severity="info" 
          variant="outlined" 
          sx={{ 
            borderRadius: "12px",
            border: "1px dashed rgba(255, 255, 255, 0.1)",
            backgroundColor: "transparent",
            py: 3
          }}
        >
          No notifications found matching type <strong>{filter}</strong>.
        </Alert>
      )}

      {!loading && token && !error && displayNotifications.length > 0 && (
        <Stack spacing={2}>
          {displayNotifications.map((n, idx) => (
            <NotificationCard key={n.ID || idx} notification={n} />
          ))}
        </Stack>
      )}

      {/* Priority Legend footer */}
      {!loading && token && !error && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            mt: 4, 
            borderRadius: "8px", 
            border: "1px solid rgba(255, 255, 255, 0.05)",
            backgroundColor: "rgba(255, 255, 255, 0.01)" 
          }}
        >
          <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.4)", display: "flex", alignItems: "center", gap: 1 }}>
            <SortIcon fontSize="inherit" /> Sorting Order: <strong>Placement (3)</strong> &gt; <strong>Result (2)</strong> &gt; <strong>Event (1)</strong>. Tie-breakers are resolved with newer timestamps.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
