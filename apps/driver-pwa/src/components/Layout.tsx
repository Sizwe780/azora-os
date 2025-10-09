import React, { ReactNode, useContext } from "react";
import { ThemeContext } from "../theme/ThemeProvider";
import "../styles/global.css";

type LayoutProps = {
  children: ReactNode;
  suite?: ReactNode;
};

export const Layout = ({ children, suite }: LayoutProps) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div data-theme={theme} style={{ minHeight: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{
        minWidth: 260, maxWidth: 280, padding: "2rem 1.5rem",
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        margin: "2rem 1.5rem"
      }}>
        <img src="/azora-logo.svg" alt="Azora OS" style={{width: 44, marginBottom: 32}} />
        <nav style={{width: "100%"}}>
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/tracking" className="nav-link">Tracking</a>
          <a href="/jobs" className="nav-link">Jobs</a>
          <a href="/suite" className="nav-link">Azora Suite</a>
          <a href="/settings" className="nav-link">Settings</a>
        </nav>
        <div style={{flexGrow: 1}} />
        <button className="glass" style={{padding: "0.5rem 1rem", marginTop: 32}} onClick={toggleTheme}>
          {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </aside>
      {/* Main area */}
      <main style={{
        flex: 1, display: "flex", flexDirection: "column",
        gap: "2rem", padding: "2.5rem 2.5rem 2.5rem 0", minHeight: "100vh"
      }}>
        {suite && <section className="suite-container elevated">{suite}</section>}
        <section className="glass elevated" style={{padding: "2rem", flex: 1, minHeight: 500}}>
          {children}
        </section>
      </main>
    </div>
  );
};
