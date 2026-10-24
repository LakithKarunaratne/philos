import { render, screen } from "@testing-library/react"
import { StatusBadge } from "@/components/cases/status-badge"
import { CaseListRow } from "@/components/cases/case-list-row"
import { NEARBY_CASES } from "@/lib/mock-data"

describe("Cases UI Components", () => {
  it("renders StatusBadge with appropriate label and style", () => {
    const { rerender } = render(<StatusBadge status="reported" label="Injured" />)
    expect(screen.getByText("Injured")).toBeInTheDocument()

    rerender(<StatusBadge status="foster" label="In Foster" />)
    expect(screen.getByText("In Foster")).toBeInTheDocument()

    rerender(<StatusBadge status="vet" />)
    expect(screen.getByText("Vet care")).toBeInTheDocument()
  })

  it("renders CaseListRow with dog details and link", () => {
    const dog = NEARBY_CASES[0]
    render(<CaseListRow dog={dog} />)

    expect(screen.getByText(dog.name)).toBeInTheDocument()
    expect(screen.getByText(dog.detail)).toBeInTheDocument()
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", `/cases/${dog.id}`)
  })
})
