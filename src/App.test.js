import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

beforeAll(() => {
  Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true,
  });
});

test('renders the app shell without crashing', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  expect(document.body).toBeTruthy();
});
