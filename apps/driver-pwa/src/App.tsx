import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AlertProvider } from "./context/AlertProvider";
import { MetricsProvider } from "./context/MetricsProvider";
import { Layout } from "./components/Layout";
import DashboardPage from "./pages/Dashboard";
import JobsPage from "./pages/Jobs";
import SettingsPage from "./pages/Settings";

export default function App() {
  return (
    <ThemeProvider>
      <AlertProvider>
        <MetricsProvider>
          <Router>
            <Layout suite={
              <div>
                <h2>Azora Suite</h2>
                <p>Advanced fleet intelligence, predictive analytics, and more.</p>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                {/* More routes as needed */}
              </Routes>
            </Layout>
          </Router>
        </MetricsProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}
