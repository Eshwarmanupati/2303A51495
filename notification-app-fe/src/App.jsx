import React from "react";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { NotificationsPage } from "./pages/NotificationsPage";

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
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", py: 2 }}>
        <NotificationsPage />
      </Box>
    </ThemeProvider>
  );
}