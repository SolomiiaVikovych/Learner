import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import './Home.css'

function Home() {
  const [decks, setDecks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchDecks = async () => {
    const response = await api.get('/decks/')
    setDecks(response.data)
  }

  const createDeck = async () => {
    if (!title.trim()) return
    await api.post('/decks/', { title, description })
    setTitle('')
    setDescription('')
    fetchDecks()
  }

  const deleteDeck = async (id) => {
    await api.delete(`/decks/${id}/`)
    fetchDecks()
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  return (
    <div className='home'>
      <div className='home-header'>
        <h1>My Decks</h1>
        <button className='btn-logout' onClick={handleLogout}>Log Out</button>
      </div>

      <div className='create-form'>
        <h2>Create New Deck</h2>
        <input
          type='text'
          placeholder='Deck title'
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type='text'
          placeholder='Description (optional)'
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button className='btn-primary' onClick={createDeck}>Create Deck</button>
      </div>

      {decks.length === 0 ? (
        <p className='empty-state'>No decks yet. Create your first one above!</p>
      ) : (
        <div className='decks-grid'>
          {decks.map(deck => (
            <div className='deck-card' key={deck.id}>
              <h3>{deck.title}</h3>
              <p>{deck.description}</p>
              <p className='progress-text'>{deck.known_count} / {deck.card_count} known</p>
              <div className='deck-actions'>
                <button className='btn-open' onClick={() => navigate(`/decks/${deck.id}`)}>Open</button>
                <button className='btn-danger' onClick={() => deleteDeck(deck.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home