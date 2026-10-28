import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apiFetch, apiUrl } from '../../src/lib/api-client';

test('browser requests use the same-origin API and merge all supported header forms', async () => {
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const originalFetch = globalThis.fetch;
  Object.defineProperty(globalThis, 'window', { value: {}, configurable: true });
  Object.defineProperty(globalThis, 'localStorage', { value: { getItem: () => 'stored-token' }, configurable: true });
  try {
    assert.equal(apiUrl('/api/auth/profile'), '/api/auth/profile');
    for (const headers of [{}, new Headers({ 'X-Test': 'yes' }), [['X-Test', 'yes']]] as HeadersInit[]) {
      globalThis.fetch = (async (url, options) => {
        assert.equal(url, '/api/auth/profile');
        const merged = new Headers(options?.headers);
        assert.equal(merged.get('content-type'), 'application/json');
        assert.equal(merged.get('authorization'), 'Bearer stored-token');
        assert.equal(options?.credentials, 'include');
        return new Response('{}');
      }) as typeof fetch;
      await apiFetch('/auth/profile', { method: 'PATCH', headers, body: JSON.stringify({ name: 'New name' }) });
    }
    globalThis.fetch = (async (_, options) => {
      const h = new Headers(options?.headers);
      assert.equal(h.get('authorization'), 'Bearer explicit');
      assert.equal(h.get('content-type'), null);
      return new Response('{}');
    }) as typeof fetch;
    await apiFetch('/upload', { method: 'POST', body: new FormData(), headers: { Authorization: 'Bearer explicit' } });
  } finally {
    globalThis.fetch = originalFetch;
    if (oldWindow) Object.defineProperty(globalThis, 'window', oldWindow); else Reflect.deleteProperty(globalThis, 'window');
    if (oldStorage) Object.defineProperty(globalThis, 'localStorage', oldStorage); else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
