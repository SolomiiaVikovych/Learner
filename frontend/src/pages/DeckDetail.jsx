import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

function DeckDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [term, setTerm] = useState('')
  const [explanation, setExplanation] = useState('')

  useEffect(() => {
    fetchDeck()
    fetchCards()
  }, [])

  const fetchDeck = async () => {
    const response = await api.get(`/decks/${id}/`)
    setDeck(response.data)
  }

  const fetchCards = async () => {
    const response = await api.get(`/cards/?deck=${id}`)
    setCards(response.data)
  }

  const createCard = async () => {
    if (!term.trim() || !explanation.trim()) return
    await api.post('/cards/', { term, explanation, deck: id })
    setTerm('')
    setExplanation('')
    fetchCards()
  }

  const deleteCard = async (cardId) => {
    await api.delete(`/cards/${cardId}/`)
    fetchCards()
  }

  if (!deck) return <p>Loading...</p>

  return (
    <div>
      <button onClick={() => navigate('/')}>← Back</button>
      <h1>{deck.title}</h1>
      <p>{deck.description}</p>
      <p>{deck.known_count} / {deck.card_count} cards known</p>
      <button onClick={() => navigate(`/study/${id}`)}>Study this deck</button>

      <div>
        <h2>Add New Card</h2>
        <input
          type='text'
          placeholder='Term'
          value={term}
          onChange={e => setTerm(e.target.value)}
        />
        <textarea
          placeholder='Explanation'
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
        />
        <button onClick={createCard}>Add Card</button>
      </div>

      <div>
        <h2>Cards ({cards.length})</h2>
        {cards.map(card => (
          <div key={card.id}>
            <h3>{card.term}</h3>
            <p>{card.explanation}</p>
            <p>{card.is_known ? '✅ Known' : '❌ Not yet known'}</p>
            <button onClick={() => deleteCard(card.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeckDetail