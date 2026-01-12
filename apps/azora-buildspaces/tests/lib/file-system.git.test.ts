import { fileSystemService } from '@/lib/services/file-system'

describe('FileSystemService git operations', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(global as any).fetch = jest.fn()
  })

  it('createBranch calls gitBranch operation', async () => {
    ;(global as any).fetch.mockResolvedValue({ ok: true })
    await fileSystemService.createBranch('c1', '/tmp/repo', 'feature-x')
    expect(fetch).toHaveBeenCalled()
    const calledWith = fetch.mock.calls[0]
    expect(calledWith[0]).toBe('/api/fs')
    const body = JSON.parse(calledWith[1].body)
    expect(body.operation).toBe('gitBranch')
    expect(body.name).toBe('feature-x')
  })

  it('switchBranch uses gitCheckout with create flag', async () => {
    ;(global as any).fetch.mockResolvedValue({ ok: true })
    await fileSystemService.switchBranch('c1', '/tmp/repo', 'feature-y', true)
    expect(fetch).toHaveBeenCalled()
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.operation).toBe('gitCheckout')
    expect(body.name).toBe('feature-y')
    expect(body.create).toBe(true)
  })

})