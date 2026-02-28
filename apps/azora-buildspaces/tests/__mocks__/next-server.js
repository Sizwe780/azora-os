/**
 * Lightweight mock for next/server so tests that import API route handlers
 * can run without the full Next.js installation.
 */

class NextRequest {
  constructor(url, init) {
    this.url = url;
    this.nextUrl = typeof url === 'string' ? new URL(url, 'http://localhost') : url;
    this.method = (init && init.method) || 'GET';
    this._body = (init && init.body) || null;
    this._headers = new Map();
    if (init && init.headers) {
      for (const [k, v] of Object.entries(init.headers)) {
        this._headers.set(k.toLowerCase(), v);
      }
    }
    this.headers = {
      get: (k) => this._headers.get(k.toLowerCase()) || null,
    };
  }

  async json() {
    if (typeof this._body === 'string') return JSON.parse(this._body);
    return this._body;
  }
}

class NextResponse {
  constructor(body, init) {
    this._body = body;
    this.status = (init && init.status) || 200;
    this._headers = new Map();
    this.headers = {
      set: (k, v) => this._headers.set(k, v),
      get: (k) => this._headers.get(k),
    };
  }

  async json() {
    return this._body;
  }

  static json(body, opts) {
    return new NextResponse(body, opts);
  }

  static next() {
    // status is intentionally undefined to match real NextResponse.next()
    const r = new NextResponse(null, {});
    r.status = undefined;
    return r;
  }
}

module.exports = { NextRequest, NextResponse };
