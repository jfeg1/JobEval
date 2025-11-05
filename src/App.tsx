import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import StoreDemo from './pages/StoreDemo'

function Home() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>JobEval - Salary Evaluation Tool</h1>
      <p>Welcome to JobEval. Use the navigation above to access different pages.</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/store-demo" style={{
          padding: '10px 20px',
          backgroundColor: '#2563eb',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          Go to Store Demo
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <nav style={{
        padding: '10px 20px',
        backgroundColor: '#1f2937',
        color: 'white',
        marginBottom: '20px'
      }}>
        <Link to="/" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
          Home
        </Link>
        <Link to="/store-demo" style={{ color: 'white', textDecoration: 'none' }}>
          Store Demo
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/store-demo" element={<StoreDemo />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
