import React, { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline, Box, Paper, Tabs, Tab, Container } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PriorityInboxPage } from "./pages/PriorityInboxPage";

// Define a premium modern dark theme with harmonious HSL-tailored colors
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7c4dff", // Modern Indigo/Purple
      light: "#b47cff",
      dark: "#3f1dcb",
    },
    secondary: {
      main: "#00e5ff", // Bright Cyan/Teal accent
    },
    background: {
      default: "#0a0b10", // Rich space black/deep blue background
      paper: "#12131a",   // Darker gray-blue paper
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 800,
    },
    subtitle2: {
      letterSpacing: "0.5px",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "radial-gradient(circle at 50% 0%, #1e1544 0%, #0a0b10 60%)",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          backgroundColor: "rgba(255, 255, 255, 0.02)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: "1.5px",
          },
        },
      },
    },
  },
});

export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Navigation Tabs Bar */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "rgba(18, 19, 26, 0.65)",
            backdropFilter: "blur(10px)",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 700,
                fontSize: "0.95rem",
                textTransform: "none",
                minHeight: "56px",
                color: "rgba(255, 255, 255, 0.5)",
                gap: 1,
                transition: "color 0.2s ease",
                "&.Mui-selected": {
                  color: "#ffffff",
                },
                "&:hover": {
                  color: "#ffffff",
                  opacity: 0.9,
                },
              },
            }}
          >
            <Tab 
              icon={<NotificationsIcon fontSize="small" />} 
              iconPosition="start" 
              label="General Inbox" 
            />
            <Tab 
              icon={<StarIcon fontSize="small" />} 
              iconPosition="start" 
              label="Priority Inbox" 
            />
          </Tabs>
        </Paper>

        {/* Render Active Page */}
        <Box sx={{ minHeight: "60vh" }}>
          {activeTab === 0 ? <NotificationsPage /> : <PriorityInboxPage />}
        </Box>
      </Container>
    </ThemeProvider>
  );
}