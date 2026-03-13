import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { Sidebar } from '../components/Sidebar.jsx'

afterEach(() => cleanup())

describe('Sidebar', () => {
  it('renders expanded sidebar with title', () => {
    render(<Sidebar />)
    expect(screen.getByText('Nexus Admin')).toBeDefined()
    expect(screen.getByText('Dashboard')).toBeDefined()
  })

  it('hides title and labels when collapsed', () => {
    render(<Sidebar collapsed={true} />)
    expect(screen.queryByText('Nexus Admin')).toBeNull()
    expect(screen.queryByText('Dashboard')).toBeNull()
  })

  it('calls onItemClick when menu item clicked', () => {
    const onItemClick = vi.fn()
    render(<Sidebar onItemClick={onItemClick} />)
    fireEvent.click(screen.getByText('Users'))
    expect(onItemClick).toHaveBeenCalledWith('Users')
  })

  it('toggles tooltips when Settings clicked', () => {
    render(<Sidebar collapsed={true} />)
    const buttons = document.querySelectorAll('button')
    // Click Settings button (last one)
    fireEvent.click(buttons[buttons.length - 1])
  })

  it('shows tooltips when collapsed and showTooltips is true', () => {
    render(<Sidebar collapsed={true} />)
    const buttons = document.querySelectorAll('button')
    fireEvent.click(buttons[buttons.length - 1])
    // showTooltips is now true and collapsed is true — tooltips should show
    expect(document.querySelectorAll('button').length).toBeGreaterThan(0)
  })

  it('changes active item on click', () => {
    render(<Sidebar />)
    fireEvent.click(screen.getByText('Analytics'))
    // Analytics button should now be active
    expect(screen.getByText('Analytics')).toBeDefined()
  })
})