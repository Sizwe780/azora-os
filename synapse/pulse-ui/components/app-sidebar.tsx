"use client"

import * as React from "react"
import {
  Activity,
  AudioWaveform,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Gauge,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  TrendingUp,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Pulse Analyst",
    email: "pulse@azora.world",
    avatar: "/avatars/pulse.jpg",
  },
  teams: [
    {
      name: "Azora ES",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Pulse Team",
      logo: Activity,
      plan: "Monitoring",
    },
    {
      name: "Atlas Team",
      logo: AudioWaveform,
      plan: "Knowledge",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: BarChart3,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "Real-time",
          url: "#",
        },
        {
          title: "Alerts",
          url: "#",
        },
      ],
    },
    {
      title: "Analytics",
      url: "#",
      icon: TrendingUp,
      items: [
        {
          title: "Performance",
          url: "#",
        },
        {
          title: "Metrics",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
      ],
    },
    {
      title: "Monitoring",
      url: "#",
      icon: Activity,
      items: [
        {
          title: "System Health",
          url: "#",
        },
        {
          title: "Logs",
          url: "#",
        },
        {
          title: "Incidents",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Alerts",
          url: "#",
        },
        {
          title: "Integrations",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "System Metrics",
      url: "#",
      icon: Gauge,
    },
    {
      name: "Performance Dashboard",
      url: "#",
      icon: BarChart3,
    },
    {
      name: "Alert Engine",
      url: "#",
      icon: Bell,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}