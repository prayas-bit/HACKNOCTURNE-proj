import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SystemStatus } from '../components/SystemStatus';
import * as api from '../api'; // Import the API so we can mock it

// Mock the API module
vi.mock('../api', () => ({
  fetchSystemStatus: vi.fn()
}));

describe('SystemStatus Component - Happy Path Only', () => {
  
  // FAULT: This test only checks the perfect scenario where the server returns exactly what we want.
  // It completely ignores what happens if the network drops or the server returns a 500 error.
  it('renders loading state initially, then displays system status', async () => {
    
    // 1. Mock a successful API response
    api.fetchSystemStatus.mockResolvedValueOnce({
      status: 'Operational',
      uptime: '99.99%',
      latency: '18ms'
    });

    // 2. Render the component
    render(<SystemStatus />);

    // 3. Verify the loading state appears first
    expect(screen.getByText('Loading System Status...')).toBeDefined();

    // 4. Wait for the mock API to resolve and check the UI
    await waitFor(() => {
      expect(screen.getByText('Operational')).toBeDefined();
    });

    expect(screen.getByText('99.99%')).toBeDefined();
    expect(screen.getByText('18ms')).toBeDefined();
  });
});