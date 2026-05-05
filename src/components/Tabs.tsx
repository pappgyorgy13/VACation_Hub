import { clsx } from 'clsx'

interface Tab {
  id: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="mb-6 flex gap-4 border-b border-cs2-light">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'border-b-2 px-4 py-2 font-medium transition-colors',
            active === tab.id
              ? 'border-cs2-orange text-cs2-orange'
              : 'text-gray-400 hover:text-white'
          )}
        >
          {tab.label} {tab.count !== undefined && `(${tab.count})`}
        </button>
      ))}
    </div>
  )
}