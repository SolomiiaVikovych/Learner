import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import DeckDetail from './pages/DeckDetail'
import Study from './pages/Study'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import Navbar from './components/Navbar'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token')
  return token ? children : <Navigate to='/login' />
}

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/landing' element={<Landing />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/' element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path='/decks/:id' element={<PrivateRoute><DeckDetail /></PrivateRoute>} />
        <Route path='/study/:id' element={<PrivateRoute><Study /></PrivateRoute>} />
      </Routes>
    </div>
  )
}

export default App