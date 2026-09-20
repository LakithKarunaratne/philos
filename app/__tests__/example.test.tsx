import { render, screen } from '@testing-library/react'

describe('Example Test Suite', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello, World!</div>

    render(<TestComponent />)

    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })

  it('should pass basic arithmetic', () => {
    expect(1 + 1).toBe(2)
  })
})
