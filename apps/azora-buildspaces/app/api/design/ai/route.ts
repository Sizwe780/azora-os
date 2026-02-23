/**
 * Design Studio — AI Design Generation API
 * 
 * Industry leaders: Figma AI, Galileo AI, Uizard, v0.dev
 * Our edge: Constitutional AI design (accessible by default, inclusive)
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const { action, prompt, context } = await req.json()

    switch (action) {
      // ─── Generate UI Component from Description ─────────────────────
      case 'generate-component': {
        const result = await generateObject({
          model: openai('gpt-4o'),
          schema: z.object({
            componentName: z.string(),
            code: z.string().describe('Complete React + Tailwind component code'),
            props: z.array(z.object({
              name: z.string(),
              type: z.string(),
              description: z.string(),
              required: z.boolean(),
            })),
            accessibilityNotes: z.array(z.string()),
            colorTokens: z.array(z.object({
              name: z.string(),
              value: z.string(),
              usage: z.string(),
            })),
            responsiveNotes: z.string(),
          }),
          prompt: `Generate a production-ready React component with Tailwind CSS.

Description: ${prompt}
Context: ${context || 'Modern web application'}

Requirements:
1. Use TypeScript with proper interfaces
2. Fully accessible (ARIA labels, keyboard navigation, screen reader support)
3. Responsive design (mobile-first)
4. Dark mode compatible (use CSS variables or class-based)
5. Follow Ubuntu design philosophy — inclusive, warm, dignified
6. Include proper error states and loading states
7. Use semantic HTML

Provide complete, working code with all imports.`,
        })
        return NextResponse.json(result.object)
      }

      // ─── Generate Color Palette ─────────────────────────────────────
      case 'generate-palette': {
        const result = await generateObject({
          model: openai('gpt-4o-mini'),
          schema: z.object({
            paletteName: z.string(),
            description: z.string(),
            colors: z.array(z.object({
              name: z.string(),
              hex: z.string(),
              rgb: z.string(),
              usage: z.string(),
              wcagAARatio: z.number(),
            })).min(5).max(12),
            textOnDark: z.string(),
            textOnLight: z.string(),
            accessibilityScore: z.number().min(0).max(100),
          }),
          prompt: `Generate a color palette for: ${prompt}
          
Requirements:
- All color combinations must pass WCAG 2.2 AA contrast (4.5:1 for text)
- Include primary, secondary, accent, success, warning, error, and neutral colors
- Dark mode compatible
- Inclusive and warm — aligned with Ubuntu philosophy`,
        })
        return NextResponse.json(result.object)
      }

      // ─── Accessibility Audit ────────────────────────────────────────
      case 'audit-accessibility': {
        const result = await generateObject({
          model: openai('gpt-4o'),
          schema: z.object({
            overallScore: z.number().min(0).max(100),
            wcagLevel: z.enum(['A', 'AA', 'AAA', 'Fail']),
            issues: z.array(z.object({
              severity: z.enum(['critical', 'major', 'minor', 'suggestion']),
              wcagCriteria: z.string(),
              description: z.string(),
              element: z.string(),
              fix: z.string(),
            })),
            strengths: z.array(z.string()),
            recommendations: z.array(z.string()),
          }),
          prompt: `Perform a WCAG 2.2 accessibility audit on this UI code:

${prompt}

Check for:
1. Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
2. Keyboard navigation and focus management
3. Screen reader compatibility (ARIA labels, roles, live regions)
4. Touch targets (minimum 44x44px)
5. Motion and animation (prefers-reduced-motion)
6. Form labeling and error handling
7. Image alt text
8. Semantic HTML structure`,
        })
        return NextResponse.json(result.object)
      }

      // ─── Layout Suggestions ─────────────────────────────────────────
      case 'suggest-layout': {
        const result = await generateObject({
          model: openai('gpt-4o-mini'),
          schema: z.object({
            layouts: z.array(z.object({
              name: z.string(),
              description: z.string(),
              gridTemplate: z.string(),
              breakpoints: z.object({
                mobile: z.string(),
                tablet: z.string(),
                desktop: z.string(),
              }),
              tailwindClasses: z.string(),
              sketch: z.string().describe('ASCII representation of the layout'),
            })).min(2).max(4),
            recommendation: z.string(),
          }),
          prompt: `Suggest responsive layouts for: ${prompt}
          
Provide 2-4 layout options with Tailwind CSS grid/flex implementations.
Include mobile, tablet, and desktop breakpoints.
Prefer layouts that feel open, accessible, and dignified.`,
        })
        return NextResponse.json(result.object)
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error: any) {
    console.error('[design/ai] Error:', error)
    return NextResponse.json({ error: error.message || 'Design AI failed' }, { status: 500 })
  }
}
