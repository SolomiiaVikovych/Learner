import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import './DeckDetail.css'

function DeckDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [term, setTerm] = useState('')
  const [explanation, setExplanation] = useState('')
  const [editingCard, setEditingCard] = useState(null)
  const [editTerm, setEditTerm] = useState('')
  const [editExplanation, setEditExplanation] = useState('')

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

  const startEditing = (card) => {
    setEditingCard(card.id)
    setEditTerm(card.term)
    setEditExplanation(card.explanation)
  }

  const cancelEditing = () => {
    setEditingCard(null)
    setEditTerm('')
    setEditExplanation('')
  }

  const saveEdit = async (cardId) => {
    if (!editTerm.trim() || !editExplanation.trim()) return
    await api.patch(`/cards/${cardId}/`, {
      term: editTerm,
      explanation: editExplanation
    })
    cancelEditing()
    fetchCards()
  }

  if (!deck) return <p>Loading...</p>

  return (
    <div className='deck-detail'>
      <div className='deck-header'>
        <button className='btn-back' onClick={() => navigate('/')}>← Back</button>
        <h1>{deck.title}</h1>
        <p>{deck.description}</p>
        <div className='deck-meta'>
          <span className='progress-text'>{deck.known_count} / {deck.card_count} cards known</span>
          <button className='btn-study' onClick={() => navigate(`/study/${id}`)}>Study this deck</button>
          <button className='btn-stats' onClick={() => navigate(`/stats/${id}`)}>📊 Statistics</button>
        </div>
      </div>

      <div className='add-card-form'>
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
        <button className='btn-primary' onClick={createCard}>Add Card</button>
      </div>

      <div className='cards-list'>
        <h2>Cards ({cards.length})</h2>
        <div className='cards-grid'>
        {cards.map(card => (
          <div className='card-item' key={card.id}>
            {editingCard === card.id ? (
              <div className='edit-form'>
                <input
                  type='text'
                  value={editTerm}
                  onChange={e => setEditTerm(e.target.value)}
                />
                <textarea
                  value={editExplanation}
                  onChange={e => setEditExplanation(e.target.value)}
                />
                <div className='edit-actions'>
                  <button className='btn-primary' onClick={() => saveEdit(card.id)}>Save</button>
                  <button className='btn-back' onClick={cancelEditing}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className='card-content'>
                  <h3>{card.term}</h3>
                  <p>{card.explanation}</p>
                  <p className={`card-status ${card.is_known ? '' : 'unknown'}`}>
                    {card.is_known ? ' Known' : ' Not yet known'}
                  </p>
                </div>
                <div className='card-item-actions'>
                  <button className='btn-edit' onClick={() => startEditing(card)}>Edit</button>
                  <button className='btn-danger' onClick={() => deleteCard(card.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}

export default DeckDetail