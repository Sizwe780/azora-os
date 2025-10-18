import { render, screen } from '@testing-library/react';
import Components from '../Components';

test('renders component', () => {
  render(<Components />);
  const linkElement = screen.getByText(/component text/i);
  expect(linkElement).toBeInTheDocument();
});