import "@fontsource/space-grotesk";
import "@fontsource/space-mono";
import createTheme from "@mui/material/styles/createTheme";

export const grabbitTheme = createTheme({
    typography: {
      fontFamily: "Space Grotesk, Rockwell",
    },
    palette: {
      mode: "light",
      primary: {
        main: "#FF5A5F",
      },
      secondary: {
        main: "#00A699",
      },
      background: {
        default: "#121212",
        paper: "#1E1E1E",
      },
      text: {
        primary: "#FFFFFF",
        secondary: "#B3B3B3",
      },
      error: {
        main: "#FF5A5F",
      },
      warning: {
        main: "#FFB400",
      },
      info: {
        main: "#00A699",
      },
      success: {
        main: "#4CAF50",
      },
    },
  });