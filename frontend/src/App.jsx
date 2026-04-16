import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DeckDetail from './pages/DeckDetail'
import Study from './pages/Study'

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/decks/:id' element={<DeckDetail />} />
        <Route path='/study/:id' element={<Study />} />
      </Routes>
    </div>
  )
}

export default App