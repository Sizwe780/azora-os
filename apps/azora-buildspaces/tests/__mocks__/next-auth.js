/**
 * Lightweight mock for next-auth so tests that import route handlers
 * using getServerSession can run without the full NextAuth installation.
 */

module.exports = {
  getServerSession: jest.fn().mockResolvedValue(null),
};
