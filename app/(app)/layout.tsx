import { BottomNav } from "@/components/layout/bottom-nav"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col pb-16">{children}</div>
      <BottomNav />
    </div>
  )
}
