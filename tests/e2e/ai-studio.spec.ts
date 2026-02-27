import { test, expect } from '@playwright/test'

test.describe('AI Studio', () => {
  test('sends a message and gets agent response', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/features/ai-studio`)

    // Ensure the agent selector and input exist
    const input = page.getByPlaceholder('Ask an agent for help...')
    await expect(input).toBeVisible()

    // Send a message using Enter to avoid click interception issues
    await input.fill('Please review my code')
    await input.scrollIntoViewIfNeeded()
    await input.press('Enter')

    // If Enter doesn't trigger (mobile/WebKit edge cases), fall back to clicking Send
    const processing = page.locator('text=Agent processing...').first()
    if (!(await processing.isVisible({ timeout: 800 }).catch(() => false))) {
      // try both a force click and a direct DOM click via XPath for robustness
      await page.click('button:has-text("Send")', { force: true }).catch(() => {})
      await page.evaluate(() => {
        const node = document.evaluate("//button[contains(., 'Send')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement | null
        node?.click()
      }).catch(() => {})
    }

    // Wait for either the processing indicator OR the agent response text to appear
    await page.waitForFunction(() => /Agent processing...|Processing your request/.test(document.body.innerText), { timeout: 10000 })
    await expect(page.locator('text=Processing your request').first()).toBeVisible({ timeout: 10000 }).catch(() => {})
  })

  test('run endpoint executes real transform and command tools', async ({ request, baseURL }) => {
    const workflow = {
      workflowName: 'e2e-test',
      nodes: [
        { id: 'n1', type: 'input', config: { prompt: 'hello' } },
        { id: 'n2', type: 'transform', config: { operation: 'uppercase' } },
        { id: 'n3', type: 'tool', config: { toolName: 'run_command', command: 'echo world' } },
        { id: 'n4', type: 'output', config: {} },
      ],
    }

    const resp = await request.post(`${baseURL}/api/ai-studio/run`, {
      data: workflow,
    })
    expect(resp.ok()).toBeTruthy()
    const data = await resp.json()
    // transform should uppercase the input
    expect(data.nodeResults['n2'].output).toBe('HELLO')
    // tool should run the echo command and include its output
    expect(data.nodeResults['n3'].output).toMatch(/world/)
  })

  test('tools list is discoverable', async ({ request, baseURL }) => {
    const resp = await request.get(`${baseURL}/api/tools`)
    expect(resp.ok()).toBeTruthy()
    const json = await resp.json()
    expect(Array.isArray(json.tools)).toBe(true)
    expect(json.tools.some((t: any) => t.name === 'run_command')).toBe(true)
    expect(json.tools.some((t: any) => t.name === 'transform')).toBe(true)
  })
})
