import React from "react";
import usePlugins from "../hooks/usePlugins";
export default function PluginLoader(props) {
  usePlugins(props);
  return null;
}
