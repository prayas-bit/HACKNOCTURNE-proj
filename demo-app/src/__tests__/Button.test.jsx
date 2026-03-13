import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Button } from '../components/Button.jsx'

afterEach(() => cleanup())

describe('Button', () => {
  it('renders the button with label', () => {
    render(<Button label="Click Me" />)
    expect(screen.getByText('Click Me')).toBeDefined()
  })
})  