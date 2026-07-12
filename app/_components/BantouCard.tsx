import type { Bantou } from '@/lib/bantou'
import BantouFace from './BantouFace'

type Props = {
  bantou: Bantou
  active: boolean
  popping: boolean
  onSelect: (id: Bantou['id']) => void
  cardRef?: (el: HTMLButtonElement | null) => void
}

export default function BantouCard({ bantou, active, popping, onSelect, cardRef }: Props) {
  return (
    <button
      ref={cardRef}
      onClick={() => onSelect(bantou.id)}
      className={`relative min-h-[44px] overflow-hidden rounded-2xl border-[2.5px] bg-card text-center transition-shadow ${
        active ? 'border-ink shadow-[0_0_0_3px_var(--color-ink)]' : 'border-line'
      } ${popping ? 'bantou-pop' : ''}`}
    >
      <span className="kasumi-burst" />
      <BantouFace
        bantou={bantou}
        className="aspect-[3/4] w-full"
        emojiClassName="text-[30px]"
      />
      <div className="px-1 py-2.5 text-[14.5px] font-extrabold">{bantou.name}</div>
    </button>
  )
}
