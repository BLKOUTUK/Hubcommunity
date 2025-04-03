import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Add TextEncoder and TextDecoder to global scope for Jest
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock the matchMedia function
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 