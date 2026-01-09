"use client"

/**
 * Atomic Previewer - Storybook-lite Component Preview
 * 
 * Constitutional Compliance:
 * - NO MOCK: Real React components, not screenshots
 * - LIVE EDITING: Props update visual instantly
 * - REAL CODE: Actual clickable components
 * 
 * Embedded component previewer with live prop editing.
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Code, Eye, Palette } from 'lucide-react'

interface ComponentPreview {
  name: string
  component: React.ComponentType<any>
  props: Record<string, any>
  propTypes: Record<string, 'string' | 'number' | 'boolean' | 'color'>
}

interface AtomicPreviewerProps {
  selectedComponent?: string
}

export function AtomicPreviewer({ selectedComponent }: AtomicPreviewerProps) {
  const [activeComponent, setActiveComponent] = useState<string>('PrimaryButton')
  const [props, setProps] = useState<Record<string, any>>({
    label: 'Click Me',
    variant: 'default',
    size: 'default',
    disabled: false,
  })

  // Component Library
  const components: Record<string, ComponentPreview> = {
    PrimaryButton: {
      name: 'Primary Button',
      component: Button,
      props: {
        children: props.label || 'Click Me',
        variant: props.variant || 'default',
        size: props.size || 'default',
        disabled: props.disabled || false,
      },
      propTypes: {
        label: 'string',
        variant: 'string',
        size: 'string',
        disabled: 'boolean',
      },
    },
    Card: {
      name: 'Card',
      component: ({ title, content }: any) => (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{title || 'Card Title'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{content || 'Card content goes here'}</p>
          </CardContent>
        </Card>
      ),
      props: {
        title: props.title || 'Card Title',
        content: props.content || 'Card content',
      },
      propTypes: {
        title: 'string',
        content: 'string',
      },
    },
    Badge: {
      name: 'Badge',
      component: Badge,
      props: {
        children: props.text || 'Badge',
        variant: props.variant || 'default',
      },
      propTypes: {
        text: 'string',
        variant: 'string',
      },
    },
  }

  const current = components[activeComponent]

  const updateProp = (key: string, value: any) => {
    setProps({ ...props, [key]: value })
  }

  const generateCode = () => {
    const propsString = Object.entries(current.props)
      .map(([key, value]) => {
        if (key === 'children') return null
        if (typeof value === 'string') return `${key}="${value}"`
        if (typeof value === 'boolean') return value ? key : null
        return `${key}={${value}}`
      })
      .filter(Boolean)
      .join(' ')

    const children = current.props.children || current.props.label || ''

    return `<${activeComponent} ${propsString}>
  ${children}
</${activeComponent}>`
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Component Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Component Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {Object.keys(components).map((key) => (
              <Button
                key={key}
                size="sm"
                variant={activeComponent === key ? 'default' : 'outline'}
                onClick={() => setActiveComponent(key)}
              >
                {components[key].name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Left: Props Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Props Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {Object.entries(current.propTypes).map(([key, type]) => (
                  <div key={key}>
                    <Label className="text-xs">{key}</Label>
                    {type === 'string' && (
                      <Input
                        value={props[key] || ''}
                        onChange={(e) => updateProp(key, e.target.value)}
                        placeholder={`Enter ${key}`}
                        className="mt-1"
                      />
                    )}
                    {type === 'number' && (
                      <Input
                        type="number"
                        value={props[key] || 0}
                        onChange={(e) => updateProp(key, parseInt(e.target.value))}
                        className="mt-1"
                      />
                    )}
                    {type === 'boolean' && (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          checked={props[key] || false}
                          onChange={(e) => updateProp(key, e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-xs text-muted-foreground">
                          {props[key] ? 'true' : 'false'}
                        </span>
                      </div>
                    )}
                    {type === 'color' && (
                      <Input
                        type="color"
                        value={props[key] || '#000000'}
                        onChange={(e) => updateProp(key, e.target.value)}
                        className="mt-1 h-10"
                      />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Preview + Code */}
        <div className="space-y-4">
          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[200px] flex items-center justify-center bg-muted rounded p-8">
                {/* Constitutional: Real component, not screenshot */}
                <current.component {...current.props} />
              </div>
            </CardContent>
          </Card>

          {/* Generated Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Code className="w-4 h-4" />
                Generated Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-black/20 p-3 rounded overflow-x-auto">
                <code>{generateCode()}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
