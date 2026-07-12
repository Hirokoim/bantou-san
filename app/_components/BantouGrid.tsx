'use client'

import { useState } from 'react'
import { BANTOU_LIST, type BantouId } from '@/lib/bantou'
import BantouCard from './BantouCard'

type Props = {
  selected: BantouId | null
  poppingId: BantouId | null
  onSelect: (id: BantouId) => void
  cardRef?: (id: BantouId, el: HTMLButtonElement | null) => void
}

export default function BantouGrid({ selected, poppingId, onSelect, cardRef }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className="flex min-h-0 flex-col bg-[#EFE8D6] md:basis-[43%] md:border-l md:border-line">
      <div className="flex flex-none items-center justify-between px-4 py-2 text-left md:block md:px-4 md:py-2.5 md:text-center">
        <p className="text-base font-bold md:text-xl">番頭さんを選ぶ</p>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="min-h-[44px] text-base text-ai underline md:hidden"
        >
          {collapsed ? '開く' : 'たたむ'}
        </button>
      </div>

      {!collapsed && (
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-3 pb-3 [scroll-snap-type:x_mandatory] md:overflow-y-auto md:overflow-x-hidden md:px-3.5 md:pb-3.5">
          <div className="flex w-max gap-2.5 md:grid md:w-auto md:grid-cols-3 md:content-start md:gap-2.5">
            {BANTOU_LIST.map((b) => (
              <div key={b.id} className="w-[108px] flex-none [scroll-snap-align:start] md:w-auto">
                <BantouCard
                  bantou={b}
                  active={selected === b.id}
                  popping={poppingId === b.id}
                  onSelect={onSelect}
                  cardRef={cardRef ? (el) => cardRef(b.id, el) : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
