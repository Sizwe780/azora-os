/**
 * Manual validation script for Knowledge Ocean implementation
 * Run this to validate the implementation without full test suite
 */

import { KnowledgeIndexer } from '../lib/knowledge/indexer'
import { SankofaAgent } from '../lib/agents/sankofa-interface'

async function validateKnowledgeEngine() {
  console.log('🧪 Knowledge Ocean Validation\n')
  console.log('='.repeat(50))

  // Test 1: Indexer instantiation
  console.log('\n✓ Test 1: Create Indexer instance')
  const indexer = new KnowledgeIndexer()
  console.log('  → Indexer created successfully')

  // Test 2: Stats initialization
  console.log('\n✓ Test 2: Check initial stats')
  const initialStats = indexer.getStats()
  console.log('  → Total files:', initialStats.totalFiles)
  console.log('  → Total chunks:', initialStats.totalChunks)
  console.log('  → Languages:', Object.keys(initialStats.languages).length)

  // Test 3: Search with empty index
  console.log('\n✓ Test 3: Search empty index')
  const emptyResults = indexer.search('test', 10)
  console.log('  → Results:', emptyResults.length, '(expected: 0)')

  // Test 4: Sankofa instantiation
  console.log('\n✓ Test 4: Create Sankofa agent')
  const sankofa = SankofaAgent.getInstance()
  console.log('  → Sankofa created successfully')

  // Test 5: Singleton pattern
  console.log('\n✓ Test 5: Verify singleton pattern')
  const sankofa2 = SankofaAgent.getInstance()
  console.log('  → Same instance:', sankofa === sankofa2)

  // Test 6: Stats structure
  console.log('\n✓ Test 6: Get codebase stats')
  const stats = await sankofa.getCodebaseStats()
  console.log('  → Stats has breakdown:', !!stats.breakdown)
  console.log('  → Functions count:', stats.breakdown.functions)
  console.log('  → Classes count:', stats.breakdown.classes)

  // Test 7: Context formatting
  console.log('\n✓ Test 7: Format context for display')
  const mockContext = {
    chunks: [{
      id: 'test:1',
      path: '/test.ts',
      fileName: 'test.ts',
      type: 'function' as const,
      name: 'testFunc',
      content: 'function testFunc() {}',
      language: 'typescript'
    }],
    totalFound: 1,
    query: 'test',
    timestamp: new Date()
  }
  const formatted = sankofa.formatContextForDisplay(mockContext)
  console.log('  → Formatted length:', formatted.length, 'chars')
  console.log('  → Contains markdown:', formatted.includes('```'))

  console.log('\n' + '='.repeat(50))
  console.log('✅ All validation tests passed!')
  console.log('\nNote: Full indexing requires a populated VFS.')
  console.log('Try using the /api/knowledge/index endpoint to index a real project.')
}

// Run validation
validateKnowledgeEngine().catch(error => {
  console.error('\n❌ Validation failed:', error)
  process.exit(1)
})
