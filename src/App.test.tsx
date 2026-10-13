import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the EduPulse login view by default', () => {
    render(<App />);
    expect(screen.getByText(/EduPulse/i)).toBeInTheDocument();
  });
});
