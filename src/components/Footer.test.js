import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

test('renders footer navigation and policies', () => {
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );

  expect(screen.getAllByText(/BRUBLA/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Shipping & Delivery/i)).toBeInTheDocument();
  expect(screen.getByText(/Customer Support/i)).toBeInTheDocument();
  expect(screen.getByText(/©\s*2026\s*BRUBLA/i)).toBeInTheDocument();
});
