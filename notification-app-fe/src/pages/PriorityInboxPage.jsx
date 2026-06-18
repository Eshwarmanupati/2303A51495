import React, { useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Box,
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
import StarIcon from "@mui/icons-material/Star";
import RefreshIcon from "@mui/icons-material/Refresh";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SortIcon from "@mui/icons-material/Sort";

import { NotificationCard } from "../components/NotificationCard";
import { useNotifications, getPriorityScore } from "../hooks/useNotifications";
import { logger } from "../api/logging";

export function PriorityInboxPage() {
  const [limit, setLimit] = useState(10);
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem("eval_auth_token") || "";
  });
  const [showToken, setShowToken] = useState(false);

  const { notifications, loading, error, refetch } = useNotifications(token, { limit: 100 });

  useEffect(() => {
    if (token) {
      logger.logPriorityPageLoad(limit);
    }
  }, [limit, token]);

  const handleTokenChange = (e) => {
    const val = e.target.value;
    setToken(val);
    localStorage.setItem("eval_auth_token", val);
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    const scoreA = getPriorityScore(a.Type);
    const scoreB = getPriorityScore(b.Type);

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    const timeA = new Date(a.Timestamp).getTime();
    const timeB = new Date(b.Timestamp).getTime();
    return timeB - timeA;
  });

  const displayNotifications = sortedNotifications.slice(0, limit);

  const highPriorityCount = notifications.filter(
    (n) => getPriorityScore(n.Type) >= 2
  ).length;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Badge badgeContent={highPriorityCount} color="error" max={99}>
            <StarIcon sx={{ fontSize: 32, color: "secondary.main" }} />
          </Badge>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
              Priority Inbox
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.4)" }}>
              Top important updates: Placements & Results first
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
                  <IconButton onClick={() => setShowToken(!showToken)} edge="end">
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
      </Paper>

      <Stack 
        direction="row" 
        spacing={2} 
        alignItems="center" 
        justifyContent="space-between" 
        mb={3}
      >
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.5)", fontWeight: 500 }}>
          Sorted by Priority Score & Recency
        </Typography>
        
        <Box sx={{ minWidth: 140 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="priority-limit-label">Inbox Size</InputLabel>
            <Select
              labelId="priority-limit-label"
              id="priority-limit-select"
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

      {loading && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10} gap={2}>
          <CircularProgress size={40} thickness={4} />
          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
            Computing and sorting priority inbox...
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
            textAlign: "center"
          }}
        >
          <Typography fontWeight={700} variant="h6" mb={1}>
            Authorization Required
          </Typography>
          Please enter your Bearer Authorization token above to fetch notifications.
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
            py: 3
          }}
        >
          No priority notifications available.
        </Alert>
      )}

      {!loading && token && !error && displayNotifications.length > 0 && (
        <Stack spacing={2}>
          {displayNotifications.map((n, idx) => (
            <NotificationCard key={n.ID || idx} notification={n} />
          ))}
        </Stack>
      )}

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
            <SortIcon fontSize="inherit" /> Weights: <strong>Placement (3)</strong> &gt; <strong>Result (2)</strong> &gt; <strong>Event (1)</strong>. Tie-breakers: newer timestamp.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
