import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders combos section', () => {
  const { getByText } = render(<App />);
  const combosTitle = getByText(/Combos/i);
  expect(combosTitle).toBeInTheDocument();
});
