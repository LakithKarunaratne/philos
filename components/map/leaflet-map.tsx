"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import type { RescueCase } from "@/lib/mock-data"

interface LeafletMapProps {
  cases: RescueCase[]
  selectedId: string | null
  onSelectCase: (id: string) => void
}

const COLOMBO_CENTER: [number, number] = [6.915, 79.863]
const USER_LOCATION: [number, number] = [6.911, 79.858]

function createPinIcon(color: string, isSelected: boolean) {
  const width = isSelected ? 32 : 26
  const height = isSelected ? 40 : 33
  return L.divIcon({
    className: "custom-leaflet-marker",
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    html: `
      <div style="
        transform: scale(${isSelected ? 1.15 : 1});
        transform-origin: bottom center;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        cursor: pointer;
        filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
      ">
        <svg viewBox="0 0 24 30" width="${width}" height="${height}" fill="none">
          <path
            d="M12 0C5.4 0 0 5.4 0 12c0 8 12 18 12 18s12-10 12-18c0-6.6-5.4-12-12-12Z"
            fill="${color}"
            stroke="#ffffff"
            stroke-width="1.8"
          />
          <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
        </svg>
      </div>
    `,
  })
}

function createUserLocationIcon() {
  return L.divIcon({
    className: "custom-pulse-marker",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: `
      <div style="position: relative; width: 16px; height: 16px;">
        <span style="
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          background-color: #e67e22;
          opacity: 0.5;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></span>
        <span style="
          position: relative;
          display: block;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background-color: #e67e22;
          border: 2.5px solid #ffffff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        "></span>
      </div>
    `,
  })
}

export default function LeafletMap({
  cases,
  selectedId,
  onSelectCase,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: COLOMBO_CENTER,
      zoom: 13,
      zoomControl: false,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map)

    // User location marker
    L.marker(USER_LOCATION, {
      icon: createUserLocationIcon(),
      interactive: false,
      zIndexOffset: 10,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Sync markers when cases change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const currentMarkers = markersRef.current

    // Remove markers not in cases
    const validIds = new Set(cases.map((c) => c.id))
    for (const [id, marker] of currentMarkers.entries()) {
      if (!validIds.has(id)) {
        marker.remove()
        currentMarkers.delete(id)
      }
    }

    // Add or update markers
    cases.forEach((dog) => {
      const isSelected = dog.id === selectedId
      const icon = createPinIcon(dog.pinColor, isSelected)

      if (currentMarkers.has(dog.id)) {
        const marker = currentMarkers.get(dog.id)!
        marker.setIcon(icon)
        marker.setLatLng([dog.lat, dog.lng])
        marker.setZIndexOffset(isSelected ? 1000 : 100)
      } else {
        const marker = L.marker([dog.lat, dog.lng], {
          icon,
          zIndexOffset: isSelected ? 1000 : 100,
        }).addTo(map)

        marker.on("click", () => {
          onSelectCase(dog.id)
        })

        currentMarkers.set(dog.id, marker)
      }
    })
  }, [cases, selectedId, onSelectCase])

  // Center on selected pin
  useEffect(() => {
    if (!selectedId || !mapRef.current) return
    const selectedCase = cases.find((c) => c.id === selectedId)
    if (selectedCase) {
      mapRef.current.panTo([selectedCase.lat, selectedCase.lng], {
        animate: true,
        duration: 0.5,
      })
    }
  }, [selectedId, cases])

  return (
    <div
      ref={containerRef}
      className="h-full w-full outline-none z-0"
      style={{ minHeight: "100%" }}
    />
  )
}
