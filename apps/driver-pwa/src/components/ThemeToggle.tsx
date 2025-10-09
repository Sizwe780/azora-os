import React from "react";
import { useTheme } from "../context/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      className="fixed top-4 right-4 z-50 bg-white/40 dark:bg-slate-900/50 rounded-full p-2 shadow hover:scale-110 transition"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="text-yellow-400" /> : <Moon className="text-blue-600" />}
    </button>
  );
}