"use client"

import { useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Plus, FolderOpen, GitBranch, Upload } from "lucide-react"
import { projectTemplates, ProjectTemplate } from "@/lib/templates/project-templates"
import { useFileSystem } from "@/lib/stores/file-system"

const makeId = () => Math.random().toString(36).slice(2, 9) // helper to generate ids without Date.now during render

interface ProjectWelcomeProps {
  onProjectSelect: (projectId: string) => void
}

export function ProjectWelcome({ onProjectSelect }: ProjectWelcomeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { createFile, rootId } = useFileSystem()

  const categories = [
    { id: 'all', name: 'All Projects', count: projectTemplates.length },
    { id: 'web', name: 'Web Apps', count: projectTemplates.filter(t => t.category === 'web').length },
    { id: 'api', name: 'APIs', count: projectTemplates.filter(t => t.category === 'api').length },
    { id: 'mobile', name: 'Mobile', count: projectTemplates.filter(t => t.category === 'mobile').length },
    { id: 'ai', name: 'AI/ML', count: projectTemplates.filter(t => t.category === 'ai').length },
  ]

  const filteredTemplates = selectedCategory === 'all'
    ? projectTemplates
    : projectTemplates.filter(t => t.category === selectedCategory)

  const handleTemplateSelect = (template: ProjectTemplate) => {
    onProjectSelect(`project-${template.id}-${makeId()}`)
  }

  const handleOpenFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const projectId = `uploaded-${makeId()}`
    for (const file of Array.from(files)) {
      const text = await file.text()
      await createFile(rootId || null, file.name, text)
    }
    onProjectSelect(projectId)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [createFile, rootId, onProjectSelect])

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleOpenFiles}
        aria-label="Open project files"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Welcome to Code Chamber</h1>
            <p className="text-sm text-muted-foreground">Choose a template or open existing files</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
            <FolderOpen className="w-4 h-4" />
            Open Files
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.dispatchEvent(new CustomEvent('workspace:clone-repo'))}>
            <GitBranch className="w-4 h-4" />
            Clone Repo
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-6 pb-0">
        <div className="flex items-center gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="gap-2"
            >
              {category.name}
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-auto p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleTemplateSelect(template)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {Object.keys(template.files).filter(key => template.files[key].type === 'file').length} files
                    </div>
                    <Button size="sm" className="gap-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Plus className="w-3 h-3" />
                      Start Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Try selecting a different category or check back later for more templates.
            </p>
            <Button onClick={() => setSelectedCategory('all')}>
              Show All Templates
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}