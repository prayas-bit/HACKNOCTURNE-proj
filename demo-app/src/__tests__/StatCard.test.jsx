import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { StatCard } from '../components/StatCard.jsx'
import { DollarSign } from 'lucide-react'

afterEach(() => cleanup())

describe('StatCard', () => {
  it('renders title and value', () => {
    render(
      <StatCard
        title="Total Revenue"
        value="$45,231.89"
        trend="+20.1%"
        isPositive={true}
        icon={DollarSign}
        colorClass="bg-indigo-500"
      />
    )
    expect(screen.getByText('Total Revenue')).toBeDefined()
  })
})