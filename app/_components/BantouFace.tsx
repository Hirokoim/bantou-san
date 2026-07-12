'use client'

import { useState } from 'react'
import type { Bantou } from '@/lib/bantou'

const SASH_BG: Record<string, string> = {
  ai: 'bg-ai',
  hari: 'bg-hari',
  fude: 'bg-fude',
  fure: 'bg-fure',
  koyo: 'bg-koyo',
  hike: 'bg-hike',
  kura: 'bg-kura',
}

type Props = {
  bantou: Bantou
  className?: string
  emojiClassName?: string
}

// イラストがあれば表示、無い・読み込み失敗時は帯色+絵文字にフォールバックする
export default function BantouFace({ bantou, className = '', emojiClassName = '' }: Props) {
  const [failed, setFailed] = useState(false)

  if (bantou.image && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={bantou.image}
        alt=""
        onError={() => setFailed(true)}
        className={`object-cover object-top ${className}`}
      />
    )
  }

  return (
    <div className={`flex items-center justify-center text-white ${SASH_BG[bantou.sashColor]} ${className} ${emojiClassName}`}>
      {bantou.emoji}
    </div>
  )
}
