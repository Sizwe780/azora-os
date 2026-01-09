/**
 * Tests for Health Check Endpoint
 */

import { GET } from "../../../app/api/health/route"

describe("/api/health", () => {
  it("should return healthy status", async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.status).toBe("healthy")
    expect(data.timestamp).toBeDefined()
    expect(data.uptime).toBeGreaterThan(0)
    expect(data.version).toBeDefined()
  })

  it("should include memory checks", async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.checks).toBeDefined()
    expect(data.checks.memory).toBeDefined()
    expect(data.checks.memory.used).toBeGreaterThan(0)
    expect(data.checks.memory.total).toBeGreaterThan(0)
    expect(data.checks.memory.percentage).toBeGreaterThan(0)
  })

  it("should include constitutional alignment score", async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.constitutional_alignment).toBeDefined()
    expect(data.constitutional_alignment).toBeGreaterThan(0)
    expect(data.constitutional_alignment).toBeLessThanOrEqual(1)
  })

  it("should include cache control headers", async () => {
    const response = await GET()

    expect(response.headers.get("Cache-Control")).toContain("no-store")
    expect(response.headers.get("X-Response-Time")).toBeDefined()
    expect(response.headers.get("X-Constitutional-Alignment")).toBeDefined()
  })

  it("should check database if DATABASE_URL is set", async () => {
    if (process.env.DATABASE_URL) {
      const response = await GET()
      const data = await response.json()

      expect(data.checks.database).toBeDefined()
      expect(data.checks.database?.status).toBeDefined()
      expect(["connected", "disconnected", "unavailable"]).toContain(
        data.checks.database?.status
      )
    }
  })
})
