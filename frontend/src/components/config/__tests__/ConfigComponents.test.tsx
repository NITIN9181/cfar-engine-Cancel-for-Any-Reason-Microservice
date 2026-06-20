import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { PartnerSelector } from '../PartnerSelector';
import { CoverageSection } from '../CoverageSection';
import { FeeSection } from '../FeeSection';
import { WindowSection } from '../WindowSection';
import { BrandingSection } from '../BrandingSection';
import { LivePreviewPanel } from '../LivePreviewPanel';
import { PartnerConfigForm } from '../PartnerConfigForm';
import { usePartnerConfig } from '../../../hooks/usePartnerConfig';

// Mock hook
vi.mock('../../../hooks/usePartnerConfig', () => ({
  usePartnerConfig: vi.fn()
}));

// Mock cfarClient
vi.mock('../../../api/cfarClient', () => ({
  cfarClient: {
    getPartnerConfig: vi.fn(),
    updatePartnerConfig: vi.fn()
  }
}));

const mockConfig = {
  partnerId: 'aerodemo_airlines',
  partnerName: 'AeroDemo Airlines',
  partialCoveragePct: 80,
  fullCoveragePct: 100,
  minCfarFeePct: 0.05,
  maxCfarFeePct: 0.15,
  cancellationWindowH: 24,
  supportedCurrencies: ['INR', 'SGD'],
  brandColor: '#1A56DB',
  brandLogoUrl: 'https://example.com/logo.png',
  webhookUrl: null,
  isActive: true
};

describe('PartnerSelector', () => {
  it('renders dropdown with correct options', () => {
    const handlePartnerChange = vi.fn();
    render(
      <PartnerSelector
        selectedPartnerId="aerodemo_airlines"
        onPartnerChange={handlePartnerChange}
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select).not.toBeNull();
    expect(select.value).toBe('aerodemo_airlines');

    fireEvent.change(select, { target: { value: 'skylink_asia' } });
    expect(handlePartnerChange).toHaveBeenCalledWith('skylink_asia');
  });
});

describe('CoverageSection', () => {
  it('renders coverage slider and updates value', () => {
    const handleChange = vi.fn();
    render(
      <CoverageSection
        partialCoveragePct={80}
        onChange={handleChange}
      />
    );

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider).not.toBeNull();
    expect(slider.value).toBe('80');

    fireEvent.change(slider, { target: { value: '75' } });
    expect(handleChange).toHaveBeenCalledWith(75);
  });
});

describe('FeeSection', () => {
  it('renders minimum and maximum fee values and updates them', () => {
    const handleChange = vi.fn();
    render(
      <FeeSection
        minFeePct={0.05}
        maxFeePct={0.15}
        onChange={handleChange}
      />
    );

    const minInput = screen.getByLabelText(/Min CFAR Fee/i) as HTMLInputElement;
    const maxInput = screen.getByLabelText(/Max CFAR Fee/i) as HTMLInputElement;

    expect(minInput.value).toBe('5');
    expect(maxInput.value).toBe('15');

    fireEvent.change(minInput, { target: { value: '6' } });
    expect(handleChange).toHaveBeenCalledWith({ minCfarFeePct: 0.06 });

    fireEvent.change(maxInput, { target: { value: '20' } });
    expect(handleChange).toHaveBeenCalledWith({ maxCfarFeePct: 0.20 });
  });

  it('allows incrementing and decrementing via buttons', () => {
    const handleChange = vi.fn();
    render(
      <FeeSection
        minFeePct={0.05}
        maxFeePct={0.15}
        onChange={handleChange}
      />
    );

    const decrementMinBtn = screen.getByTestId('dec-min-fee');
    const incrementMinBtn = screen.getByTestId('inc-min-fee');
    const decrementMaxBtn = screen.getByTestId('dec-max-fee');
    const incrementMaxBtn = screen.getByTestId('inc-max-fee');

    fireEvent.click(decrementMinBtn);
    expect(handleChange).toHaveBeenCalledWith({ minCfarFeePct: 0.04 });

    fireEvent.click(incrementMinBtn);
    expect(handleChange).toHaveBeenCalledWith({ minCfarFeePct: 0.06 });

    fireEvent.click(decrementMaxBtn);
    expect(handleChange).toHaveBeenCalledWith({ maxCfarFeePct: 0.14 });

    fireEvent.click(incrementMaxBtn);
    expect(handleChange).toHaveBeenCalledWith({ maxCfarFeePct: 0.16 });
  });
});

describe('WindowSection', () => {
  it('renders window options and updates value', () => {
    const handleChange = vi.fn();
    render(
      <WindowSection
        cancellationWindowH={24}
        onChange={handleChange}
      />
    );

    const radio12 = screen.getByLabelText(/12 hours/i) as HTMLInputElement;
    const radio24 = screen.getByLabelText(/24 hours/i) as HTMLInputElement;
    const radio48 = screen.getByLabelText(/48 hours/i) as HTMLInputElement;

    expect(radio24.checked).toBe(true);
    expect(radio12.checked).toBe(false);

    fireEvent.click(radio48);
    expect(handleChange).toHaveBeenCalledWith(48);
  });
});

describe('BrandingSection', () => {
  it('renders color picker and URL inputs and updates values', () => {
    const handleChange = vi.fn();
    render(
      <BrandingSection
        brandColor="#1A56DB"
        brandLogoUrl="https://example.com/logo.png"
        onChange={handleChange}
      />
    );

    const colorInput = screen.getByLabelText(/Brand Color/i) as HTMLInputElement;
    const logoInput = screen.getByLabelText(/Brand Logo URL/i) as HTMLInputElement;

    expect(colorInput.value).toBe('#1a56db'); // browser/jsdom lowercases hex inputs
    expect(logoInput.value).toBe('https://example.com/logo.png');

    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    expect(handleChange).toHaveBeenCalledWith({ brandColor: '#ff0000' });

    fireEvent.change(logoInput, { target: { value: 'https://example.com/new.png' } });
    expect(handleChange).toHaveBeenCalledWith({ brandLogoUrl: 'https://example.com/new.png' });
  });
});

describe('LivePreviewPanel', () => {
  it('renders preview title and live preview section', () => {
    render(<LivePreviewPanel config={mockConfig} />);
    expect(screen.getByText(/Live Checkout Preview/i)).not.toBeNull();
    expect(screen.getByText(/Mock Settings/i)).not.toBeNull();
  });
});

describe('PartnerConfigForm', () => {
  const mockUpdateConfig = vi.fn();
  const mockSaveConfig = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePartnerConfig).mockReturnValue({
      config: mockConfig,
      isLoading: false,
      error: null,
      updateConfig: mockUpdateConfig,
      saveConfig: mockSaveConfig,
      refetch: vi.fn()
    });
  });

  it('renders config sections and preview panel', async () => {
    render(<PartnerConfigForm />);

    expect(screen.getByText(/Partner Configuration/i)).not.toBeNull();
    expect(screen.getByLabelText(/Min CFAR Fee/i)).not.toBeNull();
    expect(screen.getByLabelText(/Max CFAR Fee/i)).not.toBeNull();

    // Check saving trigger
    const saveButton = screen.getByText(/Save Configuration/i);
    fireEvent.click(saveButton);
    expect(mockSaveConfig).toHaveBeenCalled();
  });

  it('renders loading skeleton state', () => {
    vi.mocked(usePartnerConfig).mockReturnValue({
      config: null,
      isLoading: true,
      error: null,
      updateConfig: mockUpdateConfig,
      saveConfig: mockSaveConfig,
      refetch: vi.fn()
    });

    render(<PartnerConfigForm />);
    expect(screen.getByTestId('config-skeleton')).not.toBeNull();
  });
});
