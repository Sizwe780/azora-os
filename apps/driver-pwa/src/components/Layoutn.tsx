import React, { ReactNode, useContext } from "react";
import { ThemeContext } from "../theme/ThemeProvider";
import { Link, useLocation } from "react-router-dom";
import { AlertBanner } from "./ui/AlertBanner";
import { ThemeToggle } from "./ui/ThemeToggle";
import "../styles/global.css";

type LayoutProps = {
  children: ReactNode;
  suite?: ReactNode;
};

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/jobs", label: "Jobs" },
  { to: "/settings", label: "Settings" },
];

export const Layout = ({ children, suite }: LayoutProps) => {
  const { theme } = useContext(ThemeContext);
  const location = useLocation();

  return (
    <div data-theme={theme} style={{ minHeight: "100vh", display: "flex" }}>
      <AlertBanner />
      <aside className="sidebar" style={{
        minWidth: 260, maxWidth: 280, padding: "2rem 1.5rem",
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        margin: "2rem 1.5rem"
      }}>
        <img src="/azora-logo.svg" alt="Azora OS" style={{ width: 44, marginBottom: 32 }} />
        <nav style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link${location.pathname === link.to ? " active" : ""}`}
              style={{
                padding: "0.6em 1em",
                borderRadius: 14,
                textDecoration: "none",
                color: "inherit",
                fontWeight: 500,
                background: location.pathname === link.to ? "var(--accent)" : "none",
                color: location.pathname === link.to ? "#fff" : "inherit",
                transition: "background 0.2s"
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div style={{ flexGrow: 1 }} />
        <ThemeToggle />
      </aside>
      <main style={{
        flex: 1, display: "flex", flexDirection: "column",
        gap: "2rem", padding: "2.5rem 2.5rem 2.5rem 0", minHeight: "100vh"
      }}>
        {suite && <section className="suite-container elevated">{suite}</section>}
        <section className="glass elevated" style={{ padding: "2rem", flex: 1, minHeight: 500 }}>
          {children}
        </section>
      </main>
    </div>
  );
};
