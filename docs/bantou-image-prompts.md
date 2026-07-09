# 番頭さん6人 画像生成プロンプト集（浮世絵風）

Midjourney / DALL-E 3 / Stable Diffusion 共用。英語プロンプトの方が安定するため英語を主とし、意図を日本語で併記しています。

---

## 使い方（3ステップ）

1. **まず「はり出し番頭」だけ生成**して画風を確定する（納得いくまで再生成）
2. 気に入った1枚を基準に、**同じ設定＋差分プロンプト**で残り5人を生成する
   - Midjourney：気に入った画像のURLを `--cref`（キャラクター参照）に指定すると顔が揃いやすい。画風は `--sref`（スタイル参照）
   - DALL-E 3：同じ会話内で「同じ画風・同じ顔立ちで、着物の色を◯◯に、持ち物を◯◯に変えて」と続けると揃いやすい
3. 生成後、正方形にトリミングして手札カード用のアイコンにする

---

## 共通ベースプロンプト

全員このベースに、下の差分（着物色・持ち物・表情）を差し込みます。

```
Traditional Japanese ukiyo-e woodblock print in the style of Edo period masters,
bust portrait (okubi-e style) of a reliable middle-aged Japanese merchant clerk (bantou),
Edo period chonmage topknot hairstyle with shaved pate,
dignified and trustworthy facial expression, thick expressive eyebrows, narrow elegant eyes,
wearing a traditional {KIMONO_COLOR} haori jacket with a white circular family crest,
holding {PROP},
flat colors, bold black key-block outlines, visible woodgrain texture,
muted mineral pigment palette on aged washi paper background,
kasumi mist bands in background, vertical title cartouche in the corner, red artist seal,
no photorealism, no 3D rendering, no anime style
```

日本語での意図：江戸の版画様式／胸から上の大首絵／月代とちょんまげ／頼れる表情・太い眉・切れ長の目／羽織に丸い家紋／フラットな色面と太い墨の主線／和紙の地に霞の帯／縦書き題字と朱の落款。

**ネガティブプロンプト**（Stable Diffusion系で使用。Midjourneyは `--no` に続けて）：
```
photorealistic, 3d, anime, manga, modern clothing, glasses, watch, 
smooth digital shading, gradient, western painting style, samurai armor, katana
```

---

## 6人分の差分

### 1. はり出し番頭（お知らせ作成）
- `{KIMONO_COLOR}` → **deep indigo blue (aizome)**
- `{PROP}` → **an unrolled paper scroll with brush calligraphy, presenting it proudly**
- 表情の追記：`confident gentle smile`（自信のある柔らかな笑み）

### 2. 筆どめ番頭（議事録まとめ）
- `{KIMONO_COLOR}` → **muted wisteria gray-purple (fujinezu)**
- `{PROP}` → **a large calligraphy brush and an inkstone, mid-writing pose**
- 表情の追記：`focused studious expression, listening carefully`（聞き取りに集中する実直な表情）

### 3. 触れ回り番頭（おしらせ配信）
- `{KIMONO_COLOR}` → **pine green (matsuba-iro)**
- `{PROP}` → **a wooden clapper (hyoshigi) raised in one hand, as if making an announcement**
- 表情の追記：`open mouth calling out energetically, lively expression`（触れ回る元気な表情）

### 4. 暦番頭（時期・締切の見張り）
- `{KIMONO_COLOR}` → **mustard ochre yellow (karashi-iro)**
- `{PROP}` → **a traditional Japanese calendar scroll (koyomi) and an hourglass-like incense clock**
- 表情の追記：`calm observant expression, slightly raised eyebrow`（先を読む落ち着いた表情）

### 5. 火消し番頭（緊急・防災）
- `{KIMONO_COLOR}` → **vermilion red (shu-iro) with black trim, edo firefighter hanten style**
- `{PROP}` → **a small matoi (Edo firefighter standard) held upright**
- 表情の追記：`brave resolute expression, strong jaw`（凛々しく肝の据わった表情）
- 追記：`edo period fire brigade aesthetic`（江戸の火消し衆の意匠）

### 6. 蔵番頭（保管・引き継ぎ）
- `{KIMONO_COLOR}` → **charcoal gray (sumi-nezu)**
- `{PROP}` → **a large old-fashioned key and a bound ledger book (daifukucho)**
- 表情の追記：`serene wise expression of an elder, faint smile`（年長者の穏やかで思慮深い表情）

---

## 完成形サンプル（はり出し番頭・コピペ用）

```
Traditional Japanese ukiyo-e woodblock print in the style of Edo period masters,
bust portrait (okubi-e style) of a reliable middle-aged Japanese merchant clerk (bantou),
Edo period chonmage topknot hairstyle with shaved pate,
dignified and trustworthy facial expression, confident gentle smile,
thick expressive eyebrows, narrow elegant eyes,
wearing a traditional deep indigo blue (aizome) haori jacket with a white circular family crest,
holding an unrolled paper scroll with brush calligraphy, presenting it proudly,
flat colors, bold black key-block outlines, visible woodgrain texture,
muted mineral pigment palette on aged washi paper background,
kasumi mist bands in background, vertical title cartouche in the corner, red artist seal,
no photorealism, no 3D rendering, no anime style
```

Midjourneyの場合は末尾に推奨：`--ar 3:4 --style raw`（縦構図・過剰な装飾を抑制）

---

## 揃えるためのコツ

- **家紋の文字（「番」の字）はAIでは正確に出ません。** 生成時は「白い丸紋」までにして、「番」の字は後からCanva等で載せるのが確実です。題字の短冊の文字も同様（生成される日本語文字はほぼ崩れます。空の短冊にして後入れ推奨）
- **1枚ずつ生成する**（6人まとめて1枚に描かせると顔が潰れます）
- 手札カード用アイコンには顔まわりを正方形トリミング。背景を消したい場合は remove.bg 等で切り抜き
- 商用利用の可否は使うツールのプランを確認（Midjourneyは有料プランで商用可。DALL-E 3は生成物の商用利用可。番頭さんの要件定義書の非機能要件「商用利用可能なAPIのみ使用」に合わせてください）

---

---

## 追加：ログイン画面（タイトル画面）用グループシーン

6人個別の大首絵とは別に、**ログイン画面のヒーロー画像**として、大番頭を中心に全員が登場する1枚を作ります。画面下3割はUI（ログインボタン等）を重ねるため、あえて絵をシンプルにする指示を入れています。

### 完成プロンプト（コピペ用）

```
Traditional Japanese ukiyo-e woodblock print in the style of Edo period masters,
wide group scene at the entrance of a traditional Edo-period counting house (帳場) with a noren curtain bearing a circular crest,
a dignified senior head clerk (大番頭, oo-bantou) standing confidently at the center front,
wearing an especially rich deep indigo haori with a double-layered white family crest, welcoming open-arm gesture, warm authoritative smile,
five junior clerks (bantou) of varying kimono colors (wisteria purple, pine green, mustard ochre, vermilion red, charcoal gray)
playfully peeking out from behind sliding shoji screens, a side window, and pillars, each holding a small tool hinting at their role
(scroll, brush, wooden clapper, calendar scroll, ledger book),
cheerful and reassuring atmosphere, whole team ready to help,
flat colors, bold black key-block outlines, visible woodgrain texture,
muted mineral pigment palette on aged washi paper background, kasumi mist bands near the top,
vertical portrait composition, the bottom third of the image kept simple and uncluttered (plain washi paper texture, no characters or important details there) to leave room for text overlay,
no photorealism, no 3D rendering, no anime style
```

Midjourney推奨オプション：`--ar 9:16 --style raw`（縦長・スマホの画面比率に近い）

### ネガティブプロンプト
```
photorealistic, 3d, anime, manga, modern clothing, glasses, watch,
smooth digital shading, gradient, western painting style, samurai armor, katana,
cluttered bottom area, text, watermark
```

### 使うときの注意
- 「番」の紋の文字・暖簾の文字はAIでは崩れるため、**紋は白無地・暖簾も無地**で出して、文字は後からCanva等で重ねるのが確実です（個別プロンプトと同じ注意点）
- 生成後、画面下3割が思ったより賑やかに出ることがあります。その場合は「ログインボタンの背景に半透明の和紙色の帯を敷く」実装側の工夫でも対応できます
- この1枚は「ログイン前」の顔になるため、6人の中で一番作り込みたい画像です。気に入るまで複数回生成することをおすすめします

---

作成日：2026年7月5日／番頭さんプロジェクト用
