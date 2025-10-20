# Azora OS Plugin System

## Overview

- Plugins are loaded from `/apps/main-app/src/plugins/`
- Each plugin exports `id`, `name`, and a `run(appContext)` function
- Plugins can add UI, endpoints, or automation

## How to Add a Plugin

1. Create `{pluginName}.js` in `/apps/main-app/src/plugins/`
2. Export `{ id, name, run }`
3. Import and register in `/apps/main-app/src/hooks/usePlugins.js`

## Example

```js
export default {
  id: "my-plugin",
  name: "My Custom Plugin",
  run: (appContext) => {
    // Do something with appContext
  }
}
```