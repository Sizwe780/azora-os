import { useEffect } from "react";

// Simple plugin loader for demo; load plugins dynamically in production
const plugins = [require("../plugins/ExamplePlugin").default];

export default function usePlugins(appContext) {
  useEffect(() => {
    plugins.forEach(plugin => {
      if (typeof plugin.run === "function") plugin.run(appContext);
    });
  }, [appContext]);
}
