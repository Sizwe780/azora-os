"use client"

import { motion } from "framer-motion"
import { BookOpen, Trophy, Users, TrendingUp, Clock, Star, Award, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SidebarLayout } from "@/components/sidebar-layout"

export default function AcademyDashboard() {
  const stats = [
    {
      title: "Courses Enrolled",
      value: "8",
      change: "+2 this month",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "AZR Earned",
      value: "1,250",
      change: "+180 this week",
      icon: Trophy,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Study Streak",
      value: "12 days",
      change: "Personal best!",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Community Rank",
      value: "#247",
      change: "Top 10% globally",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ]

  const currentCourses = [
    {
      title: "African AI Fundamentals",
      progress: 75,
      nextLesson: "Neural Networks in African Context",
      timeLeft: "2h 30m",
      instructor: "Dr. Nomsa Mthembu"
    },
    {
      title: "Blockchain for African Markets",
      progress: 45,
      nextLesson: "DeFi in Emerging Markets",
      timeLeft: "1h 15m",
      instructor: "Kofi Asante"
    },
    {
      title: "Cloud Architecture Excellence",
      progress: 90,
      nextLesson: "Final Assessment",
      timeLeft: "45m",
      instructor: "Sarah Johnson"
    }
  ]

  const achievements = [
    { name: "First Steps", description: "Completed your first course", icon: "🎓", unlocked: true },
    { name: "Knowledge Seeker", description: "Earned 500 AZR tokens", icon: "💎", unlocked: true },
    { name: "Community Builder", description: "Helped 10 fellow students", icon: "🤝", unlocked: true },
    { name: "African AI Pioneer", description: "Specialized in African AI", icon: "🇿🇦", unlocked: false }
  ]

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Sizwe! 👋</h1>
              <p className="text-cyan-100 mb-4">
                Continue your journey in African intelligence and blockchain education
              </p>
              <Badge className="bg-white/20 text-white border-white/30">
                Level 3 Student • 1,250 AZR Earned
              </Badge>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <Award className="w-10 h-10" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Current Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Current Courses</span>
              </CardTitle>
              <CardDescription>
                Continue learning and earning AZR tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentCourses.map((course, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <Badge variant="outline">{course.progress}% Complete</Badge>
                  </div>
                  <Progress value={course.progress} className="mb-3" />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Next: {course.nextLesson}</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.timeLeft} left</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">by {course.instructor}</span>
                    <Button size="sm">Continue Learning</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements & Community */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Achievements</span>
                </CardTitle>
                <CardDescription>
                  Your learning milestones and accomplishments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border-2 ${
                        achievement.unlocked
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-2">{achievement.icon}</div>
                      <h4 className="font-medium text-sm mb-1">{achievement.name}</h4>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                      {achievement.unlocked && (
                        <Badge className="mt-2 text-xs bg-green-100 text-green-700">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Community Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Community Activity</span>
                </CardTitle>
                <CardDescription>
                  Recent discussions and collaborations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Amara Okafor</span> shared insights on AI in African agriculture
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Kofi Asante</span> earned the "Blockchain Expert" badge
                    </p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      New course: "AI Ethics in African Context" now available
                    </p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </SidebarLayout>
  )
}