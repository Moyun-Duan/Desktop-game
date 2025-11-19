import React, { useEffect, useState } from 'react'

type Cell = {
  x: number
  y: number
  mine: boolean
  revealed: boolean
  flagged: boolean
  adj: number
}

type Difficulty = 'easy' | 'medium' | 'hard'
type Props = { onBack?: () => void }

const DIFFICULTIES = {
  easy: { w: 9, h: 9, mines: 10, label: '简单' },
  medium: { w: 16, h: 16, mines: 40, label: '中等' },
  hard: { w: 30, h: 16, mines: 99, label: '困难' }
}

function buildBoard(w: number, h: number, mines: number) {
  const board: Cell[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      board.push({ x, y, mine: false, revealed: false, flagged: false, adj: 0 })
    }
  }
  // place mines
  let placed = 0
  while (placed < mines) {
    const i = Math.floor(Math.random() * board.length)
    if (!board[i].mine) { board[i].mine = true; placed++ }
  }
  // adj counts
  function at(x:number,y:number){ return board.find(c=>c.x===x && c.y===y) }
  for (const c of board) {
    if (c.mine) continue
    let cnt = 0
    for (let yy = c.y - 1; yy <= c.y + 1; yy++) for (let xx = c.x - 1; xx <= c.x + 1; xx++) {
      const n = at(xx, yy)
      if (n && n.mine) cnt++
    }
    c.adj = cnt
  }
  return board
}

export default function Minesweeper({ onBack }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const config = DIFFICULTIES[difficulty]
  const [board, setBoard] = useState<Cell[]>(() => buildBoard(config.w, config.h, config.mines))
  const [lost, setLost] = useState(false)
  const [won, setWon] = useState(false)
  const [timer, setTimer] = useState(0)
  const [started, setStarted] = useState(false)
  const [firstClick, setFirstClick] = useState(true)

  useEffect(()=>{
    const revealed = board.filter(c=>c.revealed).length
    const flagged = board.filter(c=>c.flagged && c.mine).length
    if (lost) return
    if (flagged === config.mines || revealed === config.w * config.h - config.mines) setWon(true)
  }, [board, lost, config])

  useEffect(() => {
    if (!started || lost || won) return
    const id = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [started, lost, won])

  function revealCell(cell: Cell) {
    if (lost || won) return
    if (cell.flagged || cell.revealed) return
    if (!started) setStarted(true)
    
    // First click protection: regenerate if mine
    if (firstClick && cell.mine) {
      let newBoard = buildBoard(config.w, config.h, config.mines)
      let attempts = 0
      while (newBoard.find(c => c.x === cell.x && c.y === cell.y)!.mine && attempts < 100) {
        newBoard = buildBoard(config.w, config.h, config.mines)
        attempts++
      }
      setBoard(newBoard)
      setFirstClick(false)
      // Now reveal on new board
      const newCell = newBoard.find(c => c.x === cell.x && c.y === cell.y)!
      if (!newCell.mine) {
        const copy = newBoard.slice()
        function flood(x:number,y:number){
          const c = copy.find(cc=>cc.x===x && cc.y===y)
          if (!c || c.revealed || c.flagged) return
          c.revealed = true
          // 只有空白格才继续递归，但数字格已经被翻开了
          if (c.adj === 0) {
            for (let yy = y-1; yy<=y+1; yy++) {
              for (let xx=x-1; xx<=x+1; xx++) {
                flood(xx,yy)
              }
            }
          }
        }
        flood(newCell.x, newCell.y)
        setBoard(copy)
      }
      return
    }
    setFirstClick(false)
    
    if (cell.mine) {
      setLost(true)
      // reveal all
      setBoard(b => b.map(c => ({ ...c, revealed: c.mine ? true : c.revealed })))
      return
    }
    // flood fill
    const copy = board.slice()
    function flood(x:number,y:number){
      const c = copy.find(cc=>cc.x===x && cc.y===y)
      if (!c || c.revealed || c.flagged) return
      c.revealed = true
      // 只有空白格才继续递归，但数字格已经被翻开了
      if (c.adj === 0) {
        for (let yy = y-1; yy<=y+1; yy++) {
          for (let xx=x-1; xx<=x+1; xx++) {
            flood(xx,yy)
          }
        }
      }
    }
    flood(cell.x, cell.y)
    setBoard(copy)
  }

  function toggleFlag(e: React.MouseEvent, cell: Cell) {
    e.preventDefault()
    if (cell.revealed || lost || won) return
    setBoard(b => b.map(c => c.x===cell.x && c.y===cell.y ? { ...c, flagged: !c.flagged } : c))
  }

  function reset() {
    const cfg = DIFFICULTIES[difficulty]
    setBoard(buildBoard(cfg.w, cfg.h, cfg.mines))
    setLost(false)
    setWon(false)
    setTimer(0)
    setStarted(false)
    setFirstClick(true)
  }

  function changeDifficulty(diff: Difficulty) {
    setDifficulty(diff)
    const cfg = DIFFICULTIES[diff]
    setBoard(buildBoard(cfg.w, cfg.h, cfg.mines))
    setLost(false)
    setWon(false)
    setTimer(0)
    setStarted(false)
    setFirstClick(true)
  }

  const flagCount = board.filter(c => c.flagged).length
  const remainingMines = config.mines - flagCount

  return (
    <>
      <div className="game-container">
        <div className="game-box">
          <div className="game-canvas-area">
            <div className="controls" style={{marginBottom:12}}>
              <button onClick={onBack}>返回</button>
              <button onClick={reset}>重新开始</button>
              <div style={{display:'flex', alignItems:'center', gap:4}}>
                <label style={{fontSize:13, color:'#666'}}>难度：</label>
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                  <button 
                    key={d} 
                    onClick={() => changeDifficulty(d)} 
                    style={{
                      padding: '4px 10px',
                      background: difficulty === d ? '#f59e0b' : '#e5e7eb',
                      color: difficulty === d ? 'white' : '#333',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    {DIFFICULTIES[d].label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:'inline-block', background:'#cfe0f8', padding:8, borderRadius:6, border: '3px solid #f59e0b'}}>
              {Array.from({length:config.h}).map((_,y)=> (
                <div key={y} style={{display:'flex'}}>
                  {Array.from({length:config.w}).map((_,x)=>{
                    const c = board.find(cell=>cell.x===x && cell.y===y)!
                    // 根据数字设置颜色
                    const numColors = ['', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#ea580c', '#0891b2', '#334155', '#7f1d1d']
                    const style: React.CSSProperties = {
                      width: difficulty === 'hard' ? 20 : 28, 
                      height: difficulty === 'hard' ? 20 : 28, 
                      display:'inline-flex', alignItems:'center', justifyContent:'center',
                      border:'1px solid #9fb3d8', margin: difficulty === 'hard' ? 1 : 2, 
                      background: c.revealed ? (c.mine ? '#fee' : '#f7f9fe') : '#e6eefc',
                      fontSize: difficulty === 'hard' ? 11 : 14, 
                      cursor: c.revealed || lost || won ? 'default' : 'pointer', 
                      userSelect:'none',
                      fontWeight: 700,
                      color: c.revealed && !c.mine && c.adj > 0 ? numColors[c.adj] : '#333'
                    }
                    let content: React.ReactNode = ''
                    if (c.flagged) {
                      content = '🚩'
                    } else if (c.revealed) {
                      if (c.mine) {
                        content = '💣'
                      } else if (c.adj > 0) {
                        content = c.adj
                      }
                      // c.adj === 0 时显示空白
                    }
                    return (
                      <div key={x} style={style} onClick={()=>revealCell(c)} onContextMenu={(e)=>toggleFlag(e,c)}>
                        {content}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            <div style={{marginTop:12,color:'#666', fontSize:13, maxWidth: difficulty === 'hard' ? 660 : 450}}>
              🖱️ 左键翻开 | 🚩 右键标记 | 💡 首次点击保证安全
            </div>
          </div>
        </div>
        <div className="game-info-panel">
          <h3 style={{margin:'0 0 12px 0', fontSize:18, color:'#f59e0b'}}>💣 扫雷</h3>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:13, color:'#666', marginBottom:4}}>剩余地雷</div>
            <div style={{fontSize:28, fontWeight:700, color:'#dc2626'}}>{remainingMines}</div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:13, color:'#666', marginBottom:4}}>用时</div>
            <div style={{fontSize:28, fontWeight:700, color:'#2563eb'}}>{timer}s</div>
          </div>
          <div style={{padding:12, background: lost ? '#fee' : won ? '#f0fdf4' : '#f9fafb', borderRadius:6, fontSize:14, fontWeight:600, color: lost ? '#dc2626' : won ? '#10b981' : '#6b7280', textAlign:'center'}}>
            {lost ? '💥 失败' : won ? '🎉 胜利' : '🎮 进行中'}
          </div>
          <div style={{marginTop:16, padding:12, background:'white', borderRadius:6, fontSize:13, color:'#666'}}>
            <div style={{marginBottom:8}}>🎯 <strong>目标：</strong>标记所有地雷</div>
            <div style={{marginBottom:8}}>💡 <strong>提示：</strong>数字表示周围雷数</div>
            <div>🛡️ <strong>保护：</strong>首次点击不会踩雷</div>
          </div>
        </div>
      </div>

      {(lost || won) && (
        <div className="game-modal-overlay" onClick={reset}>
          <div className="game-modal" onClick={e => e.stopPropagation()}>
            <h2>{won ? '🎉 恭喜胜利！' : '💥 游戏失败'}</h2>
            <p>
              难度：<strong>{DIFFICULTIES[difficulty].label}</strong><br/>
              用时：<strong>{timer}</strong> 秒
            </p>
            <button onClick={reset}>再来一局</button>
          </div>
        </div>
      )}
    </>
  )
}
