"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Plus, Copy, Check, Layers } from "lucide-react";

interface DesignToken {
  id: string;
  name: string;
  category: "color" | "spacing" | "typography" | "shadow" | "radius";
  value: string;
}

const defaultTokens: DesignToken[] = [
  { id: "1", name: "primary", category: "color", value: "#10b981" },
  { id: "2", name: "secondary", category: "color", value: "#6366f1" },
  { id: "3", name: "background", category: "color", value: "#0d1117" },
  { id: "4", name: "surface", category: "color", value: "#161b22" },
  { id: "5", name: "spacing-sm", category: "spacing", value: "8px" },
  { id: "6", name: "spacing-md", category: "spacing", value: "16px" },
  { id: "7", name: "spacing-lg", category: "spacing", value: "24px" },
  { id: "8", name: "font-heading", category: "typography", value: "Inter, sans-serif" },
  { id: "9", name: "radius-sm", category: "radius", value: "6px" },
  { id: "10", name: "radius-lg", category: "radius", value: "12px" },
];

export default function DesignSystemManager() {
  const [tokens] = useState<DesignToken[]>(defaultTokens);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToken = (token: DesignToken) => {
    navigator.clipboard.writeText(token.value);
    setCopiedId(token.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [...new Set(tokens.map((t) => t.category))];

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          Design System
        </h3>
        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs">
          <Plus className="w-3 h-3 mr-1" /> Add Token
        </Button>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {category}
          </h4>
          {tokens
            .filter((t) => t.category === category)
            .map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  {token.category === "color" && (
                    <div
                      className="w-4 h-4 rounded border border-white/10"
                      style={{ backgroundColor: token.value }}
                    />
                  )}
                  <span className="text-xs text-gray-300 font-mono">{token.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">{token.value}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToken(token)}
                  >
                    {copiedId === token.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
