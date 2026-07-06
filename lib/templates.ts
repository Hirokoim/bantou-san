// お知らせのテンプレート。id はDB保存やプロンプトの分岐に使う
export const TEMPLATES = [
  { id: 'free',        label: '自由に書く',       hint: '' },
  { id: 'construction', label: '工事のお知らせ',   hint: '工事の内容・日時・影響範囲を含めてください' },
  { id: 'inspection',  label: '設備点検',         hint: '点検対象・日時・立ち入りの有無を含めてください' },
  { id: 'meeting',     label: '総会・理事会案内', hint: '開催日時・場所・議題を含めてください' },
  { id: 'disaster',    label: '防災訓練',         hint: '訓練の日時・集合場所・内容を含めてください' },
] as const

export type TemplateId = (typeof TEMPLATES)[number]['id']
