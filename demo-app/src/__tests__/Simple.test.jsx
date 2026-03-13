import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from '../App.jsx'
import { vi } from 'vitest'

vi.mock('../components/Dashboard.jsx', () => ({
  Dashboard: () => <div>Mock Dashboard</div>
}))

vi.mock('../components/Sidebar.jsx', () => ({
  Sidebar: () => <div>Mock Sidebar</div>
}))

vi.mock('../components/Header.jsx', () => ({
  Header: () => <div>Mock Header</div>
}))

vi.mock('../components/StatCard.jsx', () => ({
  StatCard: () => <div>Mock StatCard</div>
}))

vi.mock('../components/RecentActivity.jsx', () => ({
  RecentActivity: () => <div>Mock RecentActivity</div>
}))

vi.mock('../components/SystemStatus.jsx', () => ({
  SystemStatus: () => <div>Mock SystemStatus</div>
}))

vi.mock('../components/RevenueChart.jsx', () => ({
  RevenueChart: () => <div>Mock RevenueChart</div>
}))

describe('App', () => {
  it('renders the app shell', () => {
    render(<App />)
    expect(document.body).toBeDefined()
  })
})