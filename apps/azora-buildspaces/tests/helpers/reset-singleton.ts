/**
 * Shared test utility for resetting singleton instances.
 *
 * Many services in Azora BuildSpaces use the singleton pattern.
 * Test isolation requires resetting the static `instance` field between tests.
 * This helper provides a typed, centralized way to do that without
 * scattering @ts-ignore annotations across every test file.
 */

/**
 * Reset a singleton class by clearing its private static `instance` field.
 *
 * Usage:
 *   beforeEach(() => resetSingleton(MyService))
 */
export function resetSingleton<T extends { getInstance(): any }>(
  klass: T & { new (...args: any[]): any },
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (klass as any)['instance'] = undefined
}
