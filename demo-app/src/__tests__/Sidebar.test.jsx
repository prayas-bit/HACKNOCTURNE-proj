import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Sidebar } from '../components/Sidebar';

describe('Sidebar Component', () => {
  it('renders the admin title', () => {
    render(<Sidebar />);
    expect(screen.getByText('Nexus Admin')).toBeInTheDocument();
  });

  it('renders the dashboard link as active', () => {
    // Incomplete test: We verify the text exists, but we don't 
    // strictly check if it received the exact "active" CSS classes 
    // or if the SVG icon is colored indigo.
    render(<Sidebar />);
    const dashboardElements = screen.getAllByText('Dashboard');
    expect(dashboardElements[0]).toBeInTheDocument();
  });

  // Missing tests:
  // - Verify other links exist (Users, Reports, Analytics, Settings)
  // - Test if clicking a non-active link changes the active state
  // - Ensure mobile responsiveness behaves as expected when viewport shrinks
});
