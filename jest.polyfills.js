// jest.polyfills.js
// This file sets up polyfills needed for MSW
// Must be loaded before jest.setup.js

const { TextDecoder, TextEncoder } = require('util');
const { ReadableStream, TransformStream } = require('stream/web');
const { Blob } = require('buffer');
const fetch = require('whatwg-fetch');

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
  TransformStream: { value: TransformStream },
  Blob: { value: Blob },
  fetch: { value: fetch.fetch, writable: true, configurable: true },
  Headers: { value: fetch.Headers, writable: true, configurable: true },
  Request: { value: fetch.Request, writable: true, configurable: true },
  Response: { value: fetch.Response, writable: true, configurable: true },
});
