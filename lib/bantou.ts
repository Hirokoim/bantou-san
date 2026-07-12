// 番頭さんの人物設定を一元管理する。セリフはdocs/bantou-voice-script.mdと一致させること。
export type BantouId = 'oo' | 'hari' | 'fude' | 'fure' | 'koyo' | 'hike' | 'kura'

export type Bantou = {
  id: BantouId
  name: string
  fullName: string
  sashColor: string
  emoji: string
  image?: string
  role: string
  selectLine: string
  doneLine: string
  implemented: boolean
  notYetLine?: string
}

export const OO: Bantou = {
  id: 'oo',
  name: '大番頭',
  fullName: '大番頭さん',
  sashColor: 'ai',
  emoji: '🙂',
  role: '取り次ぎ・初期案内',
  selectLine: 'ようこそお越しくださいました。どの番頭にお申し付けになりますか',
  doneLine: '',
  implemented: false,
}

export const BANTOU_LIST: Bantou[] = [
  {
    id: 'hari',
    name: 'はり出し番頭',
    fullName: 'はり出し番頭さん',
    sashColor: 'hari',
    emoji: '📜',
    image: '/images/bantou-hari.png',
    role: 'お知らせ作成',
    selectLine: 'はり出し番頭、参りました。お知らせのことなら、お任せください',
    doneLine: 'できましたよ。ご覧くださいな',
    implemented: true,
  },
  {
    id: 'fude',
    name: '筆どめ番頭',
    fullName: '筆どめ番頭さん',
    sashColor: 'fude',
    emoji: '🖋️',
    image: '/images/bantou-fude.png',
    role: '議事録',
    selectLine: '筆どめ番頭でございます。議事録、承ります',
    doneLine: '書き上がりました。お確かめください',
    implemented: false,
    notYetLine: '筆どめ番頭でございます。議事録のお世話は、この秋から承ります。今しばらくお待ちを。',
  },
  {
    id: 'fure',
    name: '触れ回り番頭',
    fullName: '触れ回り番頭さん',
    sashColor: 'fure',
    emoji: '📣',
    image: '/images/bantou-fure.png',
    role: '配信',
    selectLine: '触れ回り番頭です。みなさんへのお届け、お任せを',
    doneLine: '触れて回りました。行き届いておりますよ',
    implemented: false,
    notYetLine: '触れ回り番頭です。みなさんへの配りもののお世話は、もう少し先になりそうです。',
  },
  {
    id: 'koyo',
    name: '暦番頭',
    fullName: '暦番頭さん',
    sashColor: 'koyo',
    emoji: '📅',
    image: '/images/bantou-koyo.png',
    role: '時期・鮮度アラート',
    selectLine: '暦番頭です。時期のことは、わたくしが見ております',
    doneLine: '暦に記しました。時期が来たらお知らせします',
    // カードから直接選ばれた場合は準備中応答。はり出し番頭からのリレー経由でのみ、期限確認の実処理が動く（Phase 7）。
    implemented: false,
    notYetLine: '暦番頭です。ふだんのご相談はもう少し先になりますが、期限のお声がけだけは、はり出し番頭の仕事が済んだ折に自らお伺いします。',
  },
  {
    id: 'hike',
    name: '火消し番頭',
    fullName: '火消し番頭さん',
    sashColor: 'hike',
    emoji: '🔔',
    image: '/images/bantou-hike.png',
    role: '緊急',
    selectLine: '火消し番頭、参上。緊急のご用、承ります',
    doneLine: '手配、完了しました。ご安心ください',
    implemented: false,
    notYetLine: '火消し番頭、参上。緊急のご用は、もう少し先から承ります。',
  },
  {
    id: 'kura',
    name: '蔵番頭',
    fullName: '蔵番頭さん',
    sashColor: 'kura',
    emoji: '🗄️',
    image: '/images/bantou-kura.png',
    role: '過去のお知らせ一覧表示',
    selectLine: '蔵番頭です。これまでの記録は、すべて蔵にございます',
    doneLine: '蔵に納めました。いつでもお出しできます',
    implemented: true,
  },
]

export function getBantou(id: BantouId): Bantou {
  if (id === 'oo') return OO
  return BANTOU_LIST.find((b) => b.id === id) ?? OO
}
