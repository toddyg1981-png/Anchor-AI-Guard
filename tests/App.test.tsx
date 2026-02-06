import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders landing page initially', () => {
    render(<App />);
    
    // Check for landing page elements
    expect(screen.getAllByText(/Anchor/i).length).toBeGreaterThan(0);
  });

  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
