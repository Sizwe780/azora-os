# @azora/shared-ui

A shared UI component library for Azora applications, built with React, TypeScript, and Tailwind CSS.

## Features

- **Modern Design System**: Consistent design language across all Azora applications
- **African Intelligence Branding**: Components designed with African markets and users in mind
- **TypeScript Support**: Full type safety and excellent developer experience
- **Accessible**: Built with Radix UI primitives for accessibility
- **Customizable**: Easy to theme and extend

## Installation

```bash
npm install @azora/shared-ui
```

## Usage

```tsx
import { Button, Card, Badge } from '@azora/shared-ui'

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Azora</CardTitle>
        <CardDescription>African intelligence at scale</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge>African AI</Badge>
        <Button>Get Started</Button>
      </CardContent>
    </Card>
  )
}
```

## Components

### Core Components
- `Button` - Interactive button component
- `Card` - Content container with header, content, and footer
- `Badge` - Status indicators and labels
- `Avatar` - User profile pictures
- `Input` - Form input fields

### Layout Components
- `Sidebar` - Collapsible navigation sidebar
- `Sheet` - Modal overlay panels
- `Separator` - Visual content separators

### Utilities
- `cn()` - Class name utility for conditional styling
- `use-mobile` - Hook for responsive mobile detection

## Theming

The library uses CSS custom properties for theming. You can customize the appearance by overriding these variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... other variables */
}
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Development mode with watch
npm run dev
```

## Contributing

This library is maintained by the Azora development team. For contributions:

1. Follow the existing code style
2. Add TypeScript types for all components
3. Include proper accessibility attributes
4. Test components across different screen sizes
5. Update documentation for new components

## License

This project is licensed under the AZORA PROPRIETARY LICENSE - see the LICENSE file for details.

Built in South Africa by Sizwe Ngwenya © 2024 Azora ES