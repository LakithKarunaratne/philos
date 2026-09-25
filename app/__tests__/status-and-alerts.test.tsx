import { act, fireEvent, render, renderHook, screen } from "@testing-library/react"
import { AlertGroup } from "@/components/alerts/alert-group"
import { StatusBadge } from "@/components/cases/status-badge"
import { StatusLegend } from "@/components/map/status-legend"
import { useStatusFilters } from "@/components/map/use-status-filters"
import { CASE_STATUSES, DEMO_CASE_ID, FILTER_ALL, STATUS_META } from "@/lib/constants"
import { INITIAL_ALERTS, STATUS_FILTERS, type AlertItem } from "@/lib/mock-data"

describe("STATUS_META", () => {
  it("drives the badge classes and label", () => {
    render(<StatusBadge status="foster" />)
    const badge = screen.getByText(STATUS_META.foster.label)
    expect(badge.className).toContain("text-status-foster")
  })

  it("drives the legend and the map filters", () => {
    render(<StatusLegend />)
    for (const status of CASE_STATUSES) {
      expect(screen.getByText(STATUS_META[status].label)).toBeInTheDocument()
    }
    expect(STATUS_FILTERS.map((f) => f.id)).toEqual([FILTER_ALL, ...CASE_STATUSES])
  })
})

describe("AlertGroup", () => {
  it("renders nothing when empty", () => {
    const { container } = render(<AlertGroup title="Today" alerts={[]} onOpenAlert={jest.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("falls back to the demo case link and reports opens", () => {
    const alert: AlertItem = { ...INITIAL_ALERTS[0], link: undefined, caseId: undefined }
    const onOpen = jest.fn()
    render(<AlertGroup title="Today" alerts={[alert]} onOpenAlert={onOpen} />)

    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", `/cases/${DEMO_CASE_ID}`)
    fireEvent.click(link)
    expect(onOpen).toHaveBeenCalledWith(alert.id)
  })
})

describe("useStatusFilters", () => {
  beforeEach(() => sessionStorage.clear())

  it("persists toggles to sessionStorage and restores them", () => {
    const { result, unmount } = renderHook(() => useStatusFilters())
    expect([...result.current.activeStatuses]).toEqual([FILTER_ALL])

    act(() => result.current.toggleStatus("vet"))
    expect([...result.current.activeStatuses]).toEqual(["vet"])
    unmount()

    const { result: restored } = renderHook(() => useStatusFilters())
    expect([...restored.current.activeStatuses]).toEqual(["vet"])

    act(() => restored.current.toggleStatus("vet"))
    expect([...restored.current.activeStatuses]).toEqual([FILTER_ALL])
  })
})
