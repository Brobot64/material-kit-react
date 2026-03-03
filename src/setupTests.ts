import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null), // Mock to return null by default
    setItem: vi.fn(() => { }),
    clear: vi.fn(() => { }),
  },
  writable: true,
});
