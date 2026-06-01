import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import './Home.css'

function InfoIcon() {
  return (
    <svg className='deck-info-icon' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <circle cx='12' cy='12' r='10' strokeWidth='1.5'/>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M12 8h.01M12 11v5'/>
    </svg>
  )
}

function Home() {
  const [decks, setDecks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchDecks() }, [])

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

  const deleteDeck = async (e, id) => {
    e.stopPropagation()
    await api.delete(`/decks/${id}/`)
    fetchDecks()
  }

  return (
    <div className='home'>
      <h1 className='home-title'>My Decks</h1>

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
        <p className='empty-state'>No decks yet — create your first one above! 🦉</p>
      ) : (
        <div className='decks-grid'>
          {decks.map(deck => (
            <div className='deck-card' key={deck.id} onClick={() => navigate(`/decks/${deck.id}`)}>
              <div className='deck-card-top'>
                <InfoIcon />
                <h3>{deck.title}</h3>
              </div>
              <p>{deck.card_count} cards</p>
              <p>{deck.known_count} known</p>
              {deck.description && <p>{deck.description}</p>}
              <div className='deck-progress-bar-track'>
                <div className='deck-progress-bar-fill' style={{
                  width: deck.card_count > 0
                    ? `${Math.round((deck.known_count / deck.card_count) * 100)}%`
                    : '0%'
                }}></div>
              </div>
              <div className='deck-card-actions'>
                <button className='btn-deck-delete' onClick={(e) => deleteDeck(e, deck.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home