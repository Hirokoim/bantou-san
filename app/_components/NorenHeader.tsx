type Props = {
  orgName: string
  muted: boolean
  onToggleMute: () => void
  onLogout: () => void
}

export default function NorenHeader({ orgName, muted, onToggleMute, onLogout }: Props) {
  return (
    <header className="noren-pleat flex-none bg-ai-deep px-5 pt-3 text-white">
      <div className="flex items-center gap-2.5 pb-2.5">
        <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border-2 border-white font-display text-lg font-extrabold">
          番
        </div>
        <div className="flex-1">
          <div className="font-display text-[19px] font-extrabold tracking-wide">番頭さん</div>
          <div className="text-[11.5px] opacity-85">{orgName}</div>
        </div>
        <button
          onClick={onToggleMute}
          aria-label={muted ? '音を出す' : '音を消す'}
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-xl"
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          onClick={onLogout}
          aria-label="ログアウト"
          className="flex h-11 min-w-11 flex-none items-center justify-center rounded-full px-2 text-sm"
        >
          ログアウト
        </button>
      </div>
    </header>
  )
}
