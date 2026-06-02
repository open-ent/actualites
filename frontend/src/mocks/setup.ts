/**
 * DO NOT MODIFY
 */

import '@testing-library/jest-dom';
import { RenderOptions, render } from '@testing-library/react';
import { ReactElement, ReactNode, createElement } from 'react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import '../i18n';
import { Providers } from '../providers';
import { MockedProviders } from './mockedProvider';
import { server } from './server';
import { mockUserLogged } from './datas/users';

// Mock useUser
const mocks = vi.hoisted(() => ({
  useUser: vi.fn(() => ({ user: mockUserLogged })),
}));

vi.mock('@open-ent/react', async () => {
  const actual =
    await vi.importActual<typeof import('@open-ent/react')>('@open-ent/react');
  return {
    ...actual,
    useUser: mocks.useUser,
  };
});

//Mocked the @open-ent/react/editor module so Editor render simple divs in tests;
// this avoids tiptap’s error when rendering the editor in tests more than once. This is a workaround.
type EditorMockProps = {
  content?: ReactNode;
};

const createMockEditorComponent =
  (displayName: string) =>
  ({ content }: EditorMockProps) =>
    createElement('div', { 'data-testid': `mock-${displayName}` }, content);

vi.mock('@open-ent/react/editor', async () => {
  const actual = await vi.importActual<typeof import('@open-ent/react/editor')>(
    '@open-ent/react/editor',
  );
  return {
    ...actual,
    Editor: createMockEditorComponent('editor'),
    EditorPreview: createMockEditorComponent('editor-preview'),
  };
});

// Enable API mocking before tests.
beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'bypass',
  }),
);

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done.
afterAll(() => server.close());

export const wrapper = MockedProviders;

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: Providers, ...options });

export * from '@testing-library/react';
export { customRender as render };
