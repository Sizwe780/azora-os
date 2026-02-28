/** @jest-environment node */

import { containerOrchestration, type ContainerConfig } from '@/lib/services/container-orchestration'

describe('ContainerOrchestrationService', () => {
  function makeConfig(overrides?: Partial<ContainerConfig>): ContainerConfig {
    return {
      id: 'container-1',
      name: 'test-container',
      image: 'node:20-alpine',
      ports: [{ internal: 3000, external: 8080, protocol: 'tcp' }],
      environment: { NODE_ENV: 'production' },
      volumes: [{ host: '/data', container: '/app/data', readonly: false }],
      resources: { memory: '512m', cpu: '1', storage: '1g' },
      runtime: 'docker',
      extensions: [],
      ...overrides,
    }
  }

  describe('createContainer', () => {
    it('should return the container ID on creation', async () => {
      const config = makeConfig()
      const id = await containerOrchestration.createContainer(config, 'user-1')
      expect(id).toBe('container-1')
    })

    it('should accept different container configurations', async () => {
      const config = makeConfig({ id: 'c-custom', image: 'python:3.12' })
      const id = await containerOrchestration.createContainer(config, 'user-2')
      expect(id).toBe('c-custom')
    })
  })

  describe('destroyContainer', () => {
    it('should not throw when destroying a container', async () => {
      await expect(containerOrchestration.destroyContainer('container-1')).resolves.toBeUndefined()
    })
  })
})
