import { afterEach, mock, beforeAll } from "bun:test";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Initialize happy-dom global environment
GlobalRegistrator.register();

// Extend expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mock((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: mock(), // deprecated
    removeListener: mock(), // deprecated
    addEventListener: mock(),
    removeEventListener: mock(),
    dispatchEvent: mock(),
  })),
});

