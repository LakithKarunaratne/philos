import { fireEvent, render, screen } from "@testing-library/react"
import { CaseStatusControl } from "@/components/cases/case-status-control"

// `useActionState` needs a real server action to bind; stub the module so the
// component renders and the form posts to a jest mock instead.
jest.mock("@/app/(app)/cases/[id]/actions", () => ({
  updateCaseStatus: jest.fn(),
}))

function renderControl(currentStatus: "reported" | "adopted" = "reported") {
  return render(
    <CaseStatusControl caseSlug="bruno" caseName="Bruno" currentStatus={currentStatus} />
  )
}

describe("CaseStatusControl", () => {
  it("offers every rescue stage", () => {
    renderControl()

    for (const label of ["Reported", "Rescued", "Vet care", "Foster", "Adopted"]) {
      expect(screen.getByText(new RegExp(`^${label}`))).toBeInTheDocument()
    }
  })

  it("disables the stage the case is already in", () => {
    renderControl()

    expect(screen.getByRole("radio", { name: /Reported \(current\)/ })).toBeDisabled()
    expect(screen.getByRole("radio", { name: "Rescued" })).toBeEnabled()
  })

  it("marks the right stage current when the case has moved on", () => {
    renderControl("adopted")

    expect(screen.getByRole("radio", { name: /Adopted \(current\)/ })).toBeDisabled()
    expect(screen.getByRole("radio", { name: "Reported" })).toBeEnabled()
  })

  it("keeps submit disabled until a stage is picked", () => {
    renderControl()

    const submit = screen.getByRole("button", { name: "Update stage" })
    expect(submit).toBeDisabled()

    fireEvent.click(screen.getByRole("radio", { name: "Rescued" }))

    expect(submit).toBeEnabled()
  })

  it("labels the note as optional and caps its length", () => {
    renderControl()

    const note = screen.getByLabelText(/Note/)
    expect(note).toHaveAttribute("maxLength", "200")
    expect(note).not.toBeRequired()
  })

  it("names the dog it is about", () => {
    renderControl()

    expect(screen.getByText(/Move Bruno to a new stage/)).toBeInTheDocument()
  })
})
