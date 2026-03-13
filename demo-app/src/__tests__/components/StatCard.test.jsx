import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { StatCard } from '../../components/StatCard';
import { Activity } from 'lucide-react';

describe('StatCard Component', () => {
  const mockProps = {
    title: 'Total Revenue',
    value: '$45,231.89',
    trend: '+20.1%',
    isPositive: true,
    icon: Activity,
    colorClass: 'bg-emerald-500'
  };

  it('displays the correct title and value', () => {
    render(<StatCard {...mockProps} />);
    
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$45,231.89')).toBeInTheDocument();
  });

  it('displays the trend percentage', () => {
    // Incomplete test: it renders the trend, but we aren't testing 
    // if the visual color representation is correctly green (positive) 
    // or red (negative).
    render(<StatCard {...mockProps} />);
    const trendElements = screen.getAllByText('+20.1%');
    expect(trendElements[0]).toBeInTheDocument();
  });

  // Missing tests:
  // - Renders the icon properly
  // - Test negative trend (isPositive: false) applies correct CSS classes
  // - Hover animations exist
});
