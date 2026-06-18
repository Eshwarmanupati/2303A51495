import React, { useState, useEffect, useRef } from "react";
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
  Pagination,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RefreshIcon from "@mui/icons-material/Refresh";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { logger } from "../api/logging";

export function NotificationsPage() {
  const [params, setParams] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "10", 10),
      notification_type: searchParams.get("notification_type") || "All",
    };
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("eval_auth_token") || "";
  });
  const [showToken, setShowToken] = useState(false);

  const { notifications, total, loading, error, refetch } = useNotifications(token, params);

  const updateUrlParams = (newParams) => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", newParams.page.toString());
    searchParams.set("limit", newParams.limit.toString());
    if (newParams.notification_type !== "All") {
      searchParams.set("notification_type", newParams.notification_type);
    }
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState(null, "", newUrl);
  };

  const handleFilterChange = (newType) => {
    const oldType = params.notification_type;
    if (oldType !== newType) {
      logger.logFilterChange("notification_type", oldType, newType);
      
      const newParams = { ...params, notification_type: newType, page: 1 };
      setParams(newParams);
      updateUrlParams(newParams);
    }
  };

  const handlePageChange = (newPage) => {
    if (params.page !== newPage) {
      logger.logPaginationChange(newPage, params.limit);
      
      const newParams = { ...params, page: newPage };
      setParams(newParams);
      updateUrlParams(newParams);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    if (params.limit !== newLimit) {
      logger.logPaginationChange(1, newLimit);
      
      const newParams = { ...params, limit: newLimit, page: 1 };
      setParams(newParams);
      updateUrlParams(newParams);
    }
  };

  const handleTokenChange = (e) => {
    const val = e.target.value;
    setToken(val);
    localStorage.setItem("eval_auth_token", val);
  };

  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      setParams({
        page: parseInt(searchParams.get("page") || "1", 10),
        limit: parseInt(searchParams.get("limit") || "10", 10),
        notification_type: searchParams.get("notification_type") || "All",
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const totalPages = Math.ceil(total / params.limit) || 1;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Badge badgeContent={total} color="primary" max={999}>
            <NotificationsIcon sx={{ fontSize: 32, color: "primary.main" }} />
          </Badge>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
              General Inbox
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.4)" }}>
              Viewing all campus notifications
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
        direction={{ xs: "column", sm: "row" }} 
        spacing={2} 
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        mb={3}
      >
        <Box>
          <NotificationFilter value={params.notification_type} onChange={handleFilterChange} />
        </Box>
        
        <Box sx={{ minWidth: 140 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="limit-select-label">Items Per Page</InputLabel>
            <Select
              labelId="limit-select-label"
              id="limit-select"
              value={params.limit}
              label="Items Per Page"
              onChange={handleLimitChange}
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
              <MenuItem value={5}>5 per page</MenuItem>
              <MenuItem value={10}>10 per page</MenuItem>
              <MenuItem value={15}>15 per page</MenuItem>
              <MenuItem value={20}>20 per page</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>

      <Divider sx={{ mb: 3, opacity: 0.1 }} />

      {loading && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10} gap={2}>
          <CircularProgress size={40} thickness={4} />
          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
            Loading general notifications...
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

      {!loading && token && !error && notifications.length === 0 && (
        <Alert 
          severity="info" 
          variant="outlined" 
          sx={{ 
            borderRadius: "12px",
            border: "1px dashed rgba(255, 255, 255, 0.1)",
            py: 3
          }}
        >
          No notifications found matching type <strong>{params.notification_type}</strong>.
        </Alert>
      )}

      {!loading && token && !error && notifications.length > 0 && (
        <>
          <Stack spacing={2} mb={4}>
            {notifications.map((n, idx) => (
              <NotificationCard key={n.ID || idx} notification={n} />
            ))}
          </Stack>

          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} mt={3}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              disabled={params.page <= 1}
              onClick={() => handlePageChange(params.page - 1)}
              sx={{ borderRadius: "8px", textTransform: "none" }}
            >
              Previous
            </Button>
            <Typography variant="body2" fontWeight={600} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Page {params.page} of {totalPages}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowForwardIcon />}
              disabled={params.page >= totalPages}
              onClick={() => handlePageChange(params.page + 1)}
              sx={{ borderRadius: "8px", textTransform: "none" }}
            >
              Next
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}
