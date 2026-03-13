import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Header } from '../../components/Header';

describe('Header Component', () => {
  it('renders without crashing', () => {
    render(<Header />);
    // Just a basic check that the search input exists
    expect(screen.getByPlaceholderText('Search resources...')).toBeInTheDocument();
  });

  it('renders the dev tools buttons', () => {
    render(<Header />);
    // Testing for the inject bug button
    const bugButtons = screen.getAllByText('🐛 Inject Bug');
    expect(bugButtons[0]).toBeInTheDocument();
    
    // Incomplete test: We should also test if the clear button exists 
    // and if clicking them actually calls window.postMessage, but leaving it incomplete.
  });

  // Missing tests:
  // - Test if the mobile menu button works
  // - Test if the bell icon has the correct ping animation state
  // - Test user profile avatar interaction
});
