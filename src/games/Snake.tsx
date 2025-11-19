import { useEffect, useRef, useState } from 'react'

type Props = { onBack?: () => void }

const WIDTH = 20
const HEIGHT = 20
const TILE = 18
const SPEED = 180 // ms per move (slower)

function randPos() {
  return { x: Math.floor(Math.random() * WIDTH), y: Math.floor(Math.random() * HEIGHT) }
}

export default function Snake({ onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [snake, setSnake] = useState<{ x: number; y: number }[]>(() => [
    { x: 9, y: 9 },
    { x: 8, y: 9 },
  ])
  const [dir, setDir] = useState<{ x: number; y: number }>({ x: 1, y: 0 })
  const [apple, setApple] = useState<{ x: number; y: number }>(() => randPos())
  const [running, setRunning] = useState(true)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // 防止方向键和空格滚动页面
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }
      if (e.key === 'ArrowUp' && dir.y !== 1) setDir({ x: 0, y: -1 })
      if (e.key === 'ArrowDown' && dir.y !== -1) setDir({ x: 0, y: 1 })
      if (e.key === 'ArrowLeft' && dir.x !== 1) setDir({ x: -1, y: 0 })
      if (e.key === 'ArrowRight' && dir.x !== -1) setDir({ x: 1, y: 0 })
      if (e.key === ' '){ setRunning(r=>!r) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dir])

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, WIDTH * TILE, HEIGHT * TILE)

    // draw apple
    ctx.fillStyle = 'crimson'
    ctx.fillRect(apple.x * TILE, apple.y * TILE, TILE - 1, TILE - 1)

    // draw snake
    ctx.fillStyle = '#1f8a5f'
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#0b6623' : '#1f8a5f'
      ctx.fillRect(s.x * TILE, s.y * TILE, TILE - 1, TILE - 1)
    })
  }, [snake, apple])

  useEffect(() => {
    let id: any = null
    function step() {
      setSnake(prev => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y }
        // wall collision
        if (head.x < 0 || head.x >= WIDTH || head.y < 0 || head.y >= HEIGHT) {
          setRunning(false)
          setGameOver(true)
          return prev
        }
        // collision with self
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].x === head.x && prev[i].y === head.y) {
            setRunning(false)
            setGameOver(true)
            return prev
          }
        }

        let grew = head.x === apple.x && head.y === apple.y
        if (grew) {
          setApple(() => {
            let p = randPos()
            // avoid spawning on snake
            while (prev.some(s => s.x === p.x && s.y === p.y)) p = randPos()
            return p
          })
          setScore(s => s + 1)
        }

        const next = [head, ...prev]
        if (!grew) next.pop()
        return next
      })
    }

    if (running) id = setInterval(step, SPEED)
    return () => { if (id) clearInterval(id) }
  }, [dir, running, apple])

  function restart() {
    setSnake([{ x: 9, y: 9 }, { x: 8, y: 9 }])
    setDir({ x: 1, y: 0 })
    setApple(randPos)
    setScore(0)
    setRunning(true)
    setGameOver(false)
  }

  return (
    <>
      <div className="game-container">
        <div className="game-box">
          <div className="game-canvas-area">
            <div className="controls">
              <button onClick={onBack}>返回</button>
              <button onClick={() => setRunning(r => !r)} disabled={gameOver}>{running ? '暂停' : '继续'}</button>
              <button onClick={restart}>重新开始</button>
            </div>
            <canvas ref={canvasRef} width={WIDTH * TILE} height={HEIGHT * TILE} style={{background:'#e9f6ef', imageRendering:'pixelated', border: '3px solid #10b981', borderRadius: 4}} />
            <div style={{marginTop:12, color:'#666', fontSize:13, maxWidth: WIDTH * TILE}}>
              ⌨️ 方向键控制 | ⏯️ 空格暂停/继续 | ⚠️ 碰壁或撞自己即失败
            </div>
          </div>
        </div>
        <div className="game-info-panel">
          <h3 style={{margin:'0 0 12px 0', fontSize:18, color:'#10b981'}}>🐍 贪吃蛇</h3>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:14, color:'#666', marginBottom:4}}>当前分数</div>
            <div style={{fontSize:32, fontWeight:700, color:'#10b981'}}>{score}</div>
          </div>
          <div style={{marginTop:16, padding:12, background:'white', borderRadius:6, fontSize:13, color:'#666'}}>
            <div style={{marginBottom:8}}>🎯 <strong>目标：</strong>吃到尽可能多的苹果</div>
            <div style={{marginBottom:8}}>⚡ <strong>速度：</strong>慢速模式</div>
            <div>💀 <strong>失败条件：</strong>撞墙或自咬</div>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="game-modal-overlay" onClick={restart}>
          <div className="game-modal" onClick={e => e.stopPropagation()}>
            <h2>💀 游戏结束</h2>
            <p>你的分数：<strong style={{fontSize:24, color:'#10b981'}}>{score}</strong></p>
            <button onClick={restart}>再来一局</button>
          </div>
        </div>
      )}
    </>
  )
}
