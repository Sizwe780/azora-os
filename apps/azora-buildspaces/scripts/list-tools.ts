// import using explicit extension to satisfy Node's ESM resolver
import { listTools } from '../lib/agents/tools.ts'

console.log(listTools().map(t => t.name))
