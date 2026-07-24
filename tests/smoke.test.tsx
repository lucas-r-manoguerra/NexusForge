import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Counter from '../src/components/Counter';

afterEach(() => {
  cleanup();
});

describe('NexusForge smoke tests', () => {
  it('project imports work', () => {
    expect(Counter).toBeDefined();
  });
});

describe('Counter component', () => {
  it('renders with initial count of 0', () => {
    render(<Counter />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('increments count on button click', () => {
    render(<Counter />);
    fireEvent.click(screen.getByRole('button', { name: /increment/i }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('increments multiple times', () => {
    render(<Counter />);
    const button = screen.getByRole('button', { name: /increment/i });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getByTestId('count')).toHaveTextContent('3');
  });
});
