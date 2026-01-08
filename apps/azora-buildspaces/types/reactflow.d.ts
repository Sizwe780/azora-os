// Minimal ambient declaration for reactflow to avoid type errors in dev environment
declare module 'reactflow' {
  export const Background: any
  export const Controls: any
  export const addEdge: (...args: any[]) => any
  export function useNodesState(init: any): any
  export function useEdgesState(init: any): any
  export type Connection = any
  export type Edge = any
  export type Node = any
  export const BackgroundVariant: any
  const ReactFlow: any
  export default ReactFlow
}
