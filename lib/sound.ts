// public/sounds/{bantouId}_{scene}.wav を再生する。ファイルが無くてもUIは止めない。
type Scene = 'select' | 'done' | 'welcome' | 'handoff'

const MUTE_KEY = 'bantou-muted'
const audioCache = new Map<string, HTMLAudioElement>()
let currentlyPlaying: HTMLAudioElement | null = null

export function isMuted(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(MUTE_KEY) === '1'
}

export function setMuted(muted: boolean) {
  localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
}

function getAudio(key: string): HTMLAudioElement {
  let audio = audioCache.get(key)
  if (!audio) {
    audio = new Audio(`/sounds/${key}.wav`)
    audio.volume = 0.8
    audioCache.set(key, audio)
  }
  return audio
}

export function play(bantouId: string, scene: Scene) {
  if (isMuted()) return
  const key = `${bantouId}_${scene}`
  try {
    if (currentlyPlaying) {
      currentlyPlaying.pause()
      currentlyPlaying.currentTime = 0
    }
    const audio = getAudio(key)
    currentlyPlaying = audio
    audio.currentTime = 0
    audio.play().catch((e) => console.warn(`[sound] ${key} の再生に失敗:`, e))
  } catch (e) {
    console.warn(`[sound] ${key} でエラー:`, e)
  }
}
