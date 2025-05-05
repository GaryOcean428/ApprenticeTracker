import { cleanup } from '@testing-library/react';
import type { MatcherState } from '@vitest/expect';
import { afterEach, expect } from 'vitest';

interface CustomMatchers {
  toBeInTheDocument(): void;
  toHaveTextContent(text: string): void;
  toBeVisible(): void;
  toHaveClass(className: string): void;
}

declare module 'vitest' {
  // Add properties to the assertion interfaces to avoid empty interface error
  interface Assertion extends CustomMatchers {
    _vitestBrand: string;
  }
  interface AsymmetricMatchersContaining extends CustomMatchers {
    _vitestAsymmetricBrand: string;
  }
}

interface MatcherResult {
  pass: boolean;
  message: () => string;
}

// Remove the utils property since it's already defined in MatcherState
interface CustomMatcherUtils extends MatcherState {
  equals: (a: unknown, b: unknown) => boolean;
}

interface DOMMatchers {
  toBeInTheDocument: (
    this: CustomMatcherUtils,
    element: Element | null
  ) => MatcherResult;
  toHaveTextContent: (
    this: CustomMatcherUtils,
    element: Element | null,
    text: string
  ) => MatcherResult;
  toBeVisible: (
    this: CustomMatcherUtils,
    element: Element | null
  ) => MatcherResult;
  toHaveClass: (
    this: CustomMatcherUtils,
    element: Element | null,
    className: string
  ) => MatcherResult;
}

const matchers: DOMMatchers = {
  toBeInTheDocument(this: CustomMatcherUtils, element: Element | null): MatcherResult {
    if (element === null) {
      return {
        pass: false,
        message: () => 'expected element to be in the document but received null',
      };
    }
    const pass = document.contains(element);
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to be in the document`,
    };
  },

  toHaveTextContent(
    this: CustomMatcherUtils,
    element: Element | null,
    text: string
  ): MatcherResult {
    if (element === null) {
      return {
        pass: false,
        message: () => 'expected element to have text content but received null',
      };
    }
    const content = element.textContent ?? '';
    const pass = content.includes(text);
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to have text content "${text}"`,
    };
  },

  toBeVisible(this: CustomMatcherUtils, element: Element | null): MatcherResult {
    if (element === null) {
      return {
        pass: false,
        message: () => 'expected element to be visible but received null',
      };
    }
    const pass = element.getBoundingClientRect().width > 0;
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to be visible`,
    };
  },

  toHaveClass(
    this: CustomMatcherUtils,
    element: Element | null,
    className: string
  ): MatcherResult {
    if (element === null) {
      return {
        pass: false,
        message: () => 'expected element to have class but received null',
      };
    }
    const pass = element.classList.contains(className);
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to have class "${className}"`,
    };
  },
};

// Add custom matchers
// @ts-expect-error - vitest types are not fully compatible with DOM matchers
expect.extend(matchers);

// Runs a cleanup after each test case
afterEach(() => {
  cleanup();
});
