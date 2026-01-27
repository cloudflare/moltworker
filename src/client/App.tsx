import AdminPage from './pages/AdminPage'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Moltbot Admin</h1>
      </header>
      <main className="app-main">
        <AdminPage />
      </main>
    </div>
  )
}
