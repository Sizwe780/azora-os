"use client"

import * as React from "react"
import {
  Activity,
  AlertTriangle,
  AudioWaveform,
  BarChart3,
  BookOpen,
  Bot,
  Command,
  Eye,
  FileCheck,
  Frame,
  GalleryVerticalEnd,
  Lock,
  Map,
  PieChart,
  Search,
  Settings2,
  Shield,
  SquareTerminal,
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
    name: "Security Analyst",
    email: "vigil@azora.world",
    avatar: "/avatars/vigil.jpg",
  },
  teams: [
    {
      name: "Azora ES",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Vigil Team",
      logo: Shield,
      plan: "Security",
    },
    {
      name: "Pulse Team",
      logo: Activity,
      plan: "Monitoring",
    },
  ],
  navMain: [
    {
      title: "Threat Intelligence",
      url: "#",
      icon: Shield,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "#",
        },
        {
          title: "Threat Feed",
          url: "#",
        },
        {
          title: "Alerts",
          url: "#",
        },
      ],
    },
    {
      title: "Security Monitoring",
      url: "#",
      icon: Eye,
      items: [
        {
          title: "Network",
          url: "#",
        },
        {
          title: "Endpoints",
          url: "#",
        },
        {
          title: "Cloud",
          url: "#",
        },
      ],
    },
    {
      title: "Incident Response",
      url: "#",
      icon: AlertTriangle,
      items: [
        {
          title: "Active Incidents",
          url: "#",
        },
        {
          title: "Response Plans",
          url: "#",
        },
        {
          title: "Forensics",
          url: "#",
        },
      ],
    },
    {
      title: "Compliance",
      url: "#",
      icon: Lock,
      items: [
        {
          title: "Policies",
          url: "#",
        },
        {
          title: "Audits",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Threat Detection",
      url: "#",
      icon: Search,
    },
    {
      name: "Security Analytics",
      url: "#",
      icon: BarChart3,
    },
    {
      name: "Compliance Engine",
      url: "#",
      icon: FileCheck,
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