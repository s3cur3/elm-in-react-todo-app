import { expect, test } from '@jest/globals'
import '@testing-library/jest-dom/jest-globals'
import { render, screen } from '@testing-library/react'
import React from 'react'
import App from './App'

test('renders learn react link', () => {
  render(<App />)
  const linkElement = screen.getByText(/learn react/i)
  expect(linkElement).toBeInTheDocument()
})
