// Utility to clean and simplify Figma node objects before sending to an LLM.
// The real Figma JSON contains a lot of geometry, transforms, styles etc. that
// are not needed when generating a React component. We strip everything down
// to a structural tree with type, name, layout and children.

export function figmaToJson(node: any): any {
  const { id, name, type, children, absoluteBoundingBox, ...rest } = node
  const result: any = { id, name, type }
  if (node.layoutMode) result.layoutMode = node.layoutMode
  if (node.absoluteBoundingBox) {
    const { x, y, width, height } = node.absoluteBoundingBox
    result.bounds = { x, y, width, height }
  }
  if (node.fills) result.fills = node.fills.map((f: any) => ({ type: f.type, color: f.color }))
  if (node.strokes) result.strokes = node.strokes.map((s: any) => ({ type: s.type, color: s.color }))
  if (children && Array.isArray(children)) {
    result.children = children.map(figmaToJson)
  }
  return result
}
