import React from "react";
import { ThemeProvider } from "./theme/ThemeProvider";
import { Layout } from "./components/Layout";

export default function App() {
  return (
    <ThemeProvider>
      <Layout suite={
        <div>
          <h2>Azora Suite</h2>
          <p>Advanced fleet intelligence, predictive analytics, and more.</p>
        </div>
      }>
        {/* Main content goes here */}
        <h1>Welcome to Azora OS</h1>
        <p>Your fleet control, now powerful and beautiful.</p>
      </Layout>
    </ThemeProvider>
  );
}
