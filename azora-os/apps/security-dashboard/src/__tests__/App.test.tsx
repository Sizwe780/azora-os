import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders the app component', () => {
  render(<App />);
  const linkElement = screen.getByText(/your app text/i);
  expect(linkElement).toBeInTheDocument();
});