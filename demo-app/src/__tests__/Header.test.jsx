import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Header } from '../components/Header';

// Clean up DOM after each test to prevent the "Multiple Elements" error
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Header Component - Full Coverage Audit', () => {
  
  it('renders all visual elements correctly', () => {
    render(<Header />);
    
    // Check Search Input
    expect(screen.getByPlaceholderText('Search resources...')).toBeInTheDocument();
    
    // Check Dev Tools Buttons exist
    expect(screen.getByText(/Inject Bug/i)).toBeInTheDocument();
    expect(screen.getByText(/Clear/i)).toBeInTheDocument();
  });

  it('executes the FORCE_MOCK_STATE logic when Inject Bug is clicked', () => {
    const postMessageSpy = vi.spyOn(window, 'postMessage');
    render(<Header />);
    
    const bugButton = screen.getByText('🐛 Inject Bug');
    fireEvent.click(bugButton);

    // This ensures the onClick function body was executed
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "FORCE_MOCK_STATE",
        payload: expect.objectContaining({ status: 500 })
      }),
      "*"
    );
  });

  it('executes the CLEAR_MOCK_STATE logic when Clear is clicked', () => {
    const postMessageSpy = vi.spyOn(window, 'postMessage');
    render(<Header />);
    
    const clearButton = screen.getByText('🧹 Clear');
    fireEvent.click(clearButton);

    // This ensures the second button's onClick function body was executed
    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: "CLEAR_MOCK_STATE" },
      "*"
    );
  });

  it('renders the mobile menu and notification bell icons', () => {
    const { container } = render(<Header />);
    
    // Check for the Lucide Menu icon (lg:hidden button)
    const menuButton = container.querySelector('.lg\\:hidden');
    expect(menuButton).toBeInTheDocument();

    // Check for the Bell icon
    const bellButton = container.querySelector('.lucide-bell');
    expect(bellButton).toBeInTheDocument();
  });
});