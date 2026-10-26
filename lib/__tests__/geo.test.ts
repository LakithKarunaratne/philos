import { distanceKm, distanceLabel, formatDistance, USER_ORIGIN } from "@/lib/geo"

describe("distanceKm", () => {
  it("is zero for the same point", () => {
    expect(distanceKm(USER_ORIGIN, USER_ORIGIN)).toBe(0)
  })

  it("measures a short Colombo hop", () => {
    // Galle Road, Kollupitiya — roughly 700 m from the stand-in user origin.
    expect(distanceKm(USER_ORIGIN, [6.9147, 79.8528])).toBeCloseTo(0.7, 1)
  })

  it("is symmetric", () => {
    const there = distanceKm(USER_ORIGIN, [6.892, 79.856])
    const back = distanceKm([6.892, 79.856], USER_ORIGIN)
    expect(there).toBeCloseTo(back, 10)
  })
})

describe("formatDistance", () => {
  it("switches from metres to kilometres at 1 km", () => {
    expect(formatDistance(0.35)).toBe("350 m away")
    expect(formatDistance(0.999)).toBe("999 m away")
    expect(formatDistance(1)).toBe("1.0 km away")
    expect(formatDistance(2.64)).toBe("2.6 km away")
  })
})

describe("distanceLabel", () => {
  it("renders a case's distance from the user origin", () => {
    expect(distanceLabel(USER_ORIGIN[0], USER_ORIGIN[1])).toBe("0 m away")
    expect(distanceLabel(6.892, 79.856)).toMatch(/^\d+(\.\d)? (m|km) away$/)
  })
})
