import { afterEach, mock } from "bun:test";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Mock react-onesignal before any imports (prevents script loading in happy-dom)
mock.module("react-onesignal", () => ({
  default: {
    init: mock(() => Promise.resolve()),
    login: mock(() => Promise.resolve()),
    logout: mock(() => Promise.resolve()),
    setExternalUserId: mock(() => Promise.resolve()),
    sendTag: mock(() => Promise.resolve()),
    sendTags: mock(() => Promise.resolve()),
    getTags: mock(() => Promise.resolve({})),
    deleteTag: mock(() => Promise.resolve()),
    deleteTags: mock(() => Promise.resolve()),
    addListenerForNotificationOpened: mock(() => {}),
    setSubscription: mock(() => Promise.resolve()),
    getSubscription: mock(() => Promise.resolve(false)),
    setEmail: mock(() => Promise.resolve()),
    setSMSNumber: mock(() => Promise.resolve()),
    User: {
      addTag: mock(() => Promise.resolve()),
      addTags: mock(() => Promise.resolve()),
    },
    Notifications: {
      permission: false,
      requestPermission: mock(() => Promise.resolve()),
    },
  },
}));

// Initialize happy-dom global environment with settings to prevent external script loading
GlobalRegistrator.register({
  settings: {
    disableJavaScriptFileLoading: true,
    disableJavaScriptEvaluation: false,
    disableCSSFileLoading: true,
    navigation: {
      disableMainFrameNavigation: true,
      disableChildFrameNavigation: true,
      disableChildPageNavigation: true,
      disableFallbackToSetURL: true,
    },
  },
});

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

