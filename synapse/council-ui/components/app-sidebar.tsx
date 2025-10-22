"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Brain,
  Command,
  FileText,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  Shield,
  SquareTerminal,
  Users,
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
    name: "Council Member",
    email: "council@azora.world",
    avatar: "/avatars/council.jpg",
  },
  teams: [
    {
      name: "Azora ES",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Council Team",
      logo: Command,
      plan: "Governance",
    },
    {
      name: "Atlas Team",
      logo: AudioWaveform,
      plan: "Knowledge",
    },
  ],
  navMain: [
    {
      title: "Governance",
      url: "#",
      icon: Command,
      isActive: true,
      items: [
        {
          title: "Proposals",
          url: "#",
        },
        {
          title: "Voting",
          url: "#",
        },
        {
          title: "Decisions",
          url: "#",
        },
      ],
    },
    {
      title: "Constitutional AI",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Framework",
          url: "#",
        },
        {
          title: "Policies",
          url: "#",
        },
        {
          title: "Compliance",
          url: "#",
        },
      ],
    },
    {
      title: "Council Members",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Directory",
          url: "#",
        },
        {
          title: "Roles",
          url: "#",
        },
        {
          title: "Permissions",
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
          title: "Security",
          url: "#",
        },
        {
          title: "Audit",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Policy Framework",
      url: "#",
      icon: FileText,
    },
    {
      name: "Decision Engine",
      url: "#",
      icon: Brain,
    },
    {
      name: "Audit System",
      url: "#",
      icon: Shield,
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