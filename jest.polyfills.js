// jest.polyfills.js
// This file sets up polyfills needed for MSW
// Must be loaded before jest.setup.js

const { TextDecoder, TextEncoder } = require('util');
const { ReadableStream, TransformStream } = require('stream/web');
const { Blob } = require('buffer');

// Only load whatwg-fetch if available (for jsdom environment)
let fetch;
try {
  fetch = require('whatwg-fetch');
} catch (e) {
  // For node environment, use global fetch (Node 18+)
  fetch = globalThis.fetch ? {
    fetch: globalThis.fetch,
    Headers: globalThis.Headers,
    Request: globalThis.Request,
    Response: globalThis.Response,
  } : null;
}

const polyfills = {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
  TransformStream: { value: TransformStream },
  Blob: { value: Blob },
};

// Only add fetch polyfills if available
if (fetch) {
  Object.assign(polyfills, {
    fetch: { value: fetch.fetch, writable: true, configurable: true },
    Headers: { value: fetch.Headers, writable: true, configurable: true },
    Request: { value: fetch.Request, writable: true, configurable: true },
    Response: { value: fetch.Response, writable: true, configurable: true },
  });
}

Object.defineProperties(globalThis, polyfills);
