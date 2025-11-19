// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { useState } from 'react'
import './App.css'
import './games/GameLayout.css'
import Snake from './games/Snake.tsx'
import Minesweeper from './games/Minesweeper.tsx'

type View = 'home' | 'snake' | 'minesweeper'

function App() {
  const [view, setView] = useState<View>('home')

  return (
    <div className="app-root">
      <header className="app-header">
        <h1 className="title">小游戏合集</h1>
        <nav className="nav">
          <button onClick={() => setView('home')} className={view === 'home' ? 'active' : ''}>主页</button>
          <button onClick={() => setView('snake')} className={view === 'snake' ? 'active' : ''}>贪吃蛇</button>
          <button onClick={() => setView('minesweeper')} className={view === 'minesweeper' ? 'active' : ''}>扫雷</button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'home' && (
          <section className="home">
            <div className="hero-section">
              <h2 className="hero-title">🎮 在线小游戏合集</h2>
              <p className="hero-subtitle">经典游戏，随时畅玩 | 无需下载，即刻开始</p>
            </div>
            <div className="game-list">
              <div className="game-card snake-card" onClick={() => setView('snake')}>
                <div className="game-icon">🐍</div>
                <h3>贪吃蛇</h3>
                <p className="game-desc">经典街机游戏，操控蛇吃食物变长，小心碰壁！</p>
                <div className="game-badge">即刻开玩</div>
              </div>
              <div className="game-card mine-card" onClick={() => setView('minesweeper')}>
                <div className="game-icon">💣</div>
                <h3>扫雷</h3>
                <p className="game-desc">考验逻辑的智力游戏，标记地雷并翻开所有安全区域</p>
                <div className="game-badge">挑战智力</div>
              </div>
            </div>
            <div className="feature-banner">
              <div className="feature-item">✨ 无需注册</div>
              <div className="feature-item">🚀 秒开即玩</div>
              <div className="feature-item">📱 全平台支持</div>
            </div>
          </section>
        )}

        {view === 'snake' && <Snake onBack={() => setView('home')} />}
        {view === 'minesweeper' && <Minesweeper onBack={() => setView('home')} />}
      </main>

      <footer className="app-footer">小站演示 · 简易实现</footer>
    </div>
  )
}

export default App
