import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { StatCard } from '../components/StatCard';
import { Activity } from 'lucide-react';

describe('StatCard Component - Low Coverage Mode', () => {
  const positiveProps = {
    title: 'Total Revenue',
    value: '$45,231.89',
    trend: '+20.1%',
    isPositive: true, // We ONLY test the positive path
    icon: Activity,
    colorClass: 'bg-emerald-500'
  };

  it('renders only the basic positive state', () => {
    render(<StatCard {...positiveProps} />);
    
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    // We stop here. 
    // We are NOT testing 'isPositive: false' logic.
    // We are NOT testing if the icon actually renders.
  });
});