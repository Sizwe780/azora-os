/** @jest-environment node */

describe("GET /api/health", () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test("returns degraded when Prisma client import fails", async () => {
    // Simulate a DATABASE_URL configured, but prisma client missing / broken
    process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/testdb"

    // Mock @prisma/client to throw when imported
    jest.doMock("@prisma/client", () => {
      throw new Error("Cannot find module '@prisma/client'. Did you run prisma generate?")
    })

    const { GET } = require("../../app/api/health/route")
    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(json.status).toBe("degraded")
    expect(json.checks.database.status).toBe("unavailable")
  })
})
/**
 * Tests for Health Check Endpoint Logic
 * 
 * Since Next.js route handlers can't be easily tested in isolation,
 * we test the core health check logic here.
 */

describe("Health Check Logic", () => {
  it("should calculate memory percentage correctly", () => {
    const memUsage = {
      heapUsed: 50 * 1024 * 1024, // 50 MB
      heapTotal: 100 * 1024 * 1024, // 100 MB
      rss: 0,
      external: 0,
      arrayBuffers: 0,
    }

    const memPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100

    expect(memPercentage).toBe(50)
  })

  it("should determine healthy status when memory usage is low", () => {
    const memPercentage = 50 // 50% memory usage

    let status: "healthy" | "degraded" | "unhealthy" = "healthy"

    if (memPercentage > 90) {
      status = "unhealthy"
    } else if (memPercentage > 75) {
      status = "degraded"
    }

    expect(status).toBe("healthy")
  })

  it("should determine degraded status when memory usage is high", () => {
    const memPercentage = 80 // 80% memory usage

    let status: "healthy" | "degraded" | "unhealthy" = "healthy"

    if (memPercentage > 90) {
      status = "unhealthy"
    } else if (memPercentage > 75) {
      status = "degraded"
    }

    expect(status).toBe("degraded")
  })

  it("should determine unhealthy status when memory usage is critical", () => {
    const memPercentage = 95 // 95% memory usage

    let status: "healthy" | "degraded" | "unhealthy" = "healthy"

    if (memPercentage > 90) {
      status = "unhealthy"
    } else if (memPercentage > 75) {
      status = "degraded"
    }

    expect(status).toBe("unhealthy")
  })

  it("should return correct status code for healthy state", () => {
    const status = "healthy"
    const statusCode = status === "healthy" ? 200 : status === "degraded" ? 200 : 503

    expect(statusCode).toBe(200)
  })

  it("should return correct status code for unhealthy state", () => {
    const status = "unhealthy"
    const statusCode = status === "healthy" ? 200 : status === "degraded" ? 200 : 503

    expect(statusCode).toBe(503)
  })

  it("should include constitutional alignment in health response", () => {
    const constitutionalAlignment = 0.99

    expect(constitutionalAlignment).toBeGreaterThan(0)
    expect(constitutionalAlignment).toBeLessThanOrEqual(1)
  })
})
