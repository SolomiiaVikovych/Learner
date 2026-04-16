import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

function Study() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const deckResponse = await api.get(`/decks/${id}/`)
    const cardsResponse = await api.get(`/cards/?deck=${id}`)
    setDeck(deckResponse.data)
    setCards(cardsResponse.data)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAnswer = async (known) => {
    const card = cards[currentIndex]

    if (card.is_known !== known) {
      await api.patch(`/cards/${card.id}/toggle_known/`)
    }

    const nextIndex = currentIndex + 1
    if (nextIndex >= cards.length) {
      setFinished(true)
    } else {
      setCurrentIndex(nextIndex)
      setIsFlipped(false)
    }
  }

  if (!deck || cards.length === 0) return <p>Loading...</p>

  if (finished) {
    return (
      <div>
        <h1>Session Complete! 🎉</h1>
        <p>You went through all {cards.length} cards.</p>
        <button onClick={() => navigate(`/decks/${id}`)}>Back to Deck</button>
        <button onClick={() => navigate('/')}>Home</button>
      </div>
    )
  }

  const card = cards[currentIndex]
  const progress = Math.round((currentIndex / cards.length) * 100)

  return (
    <div>
      <button onClick={() => navigate(`/decks/${id}`)}>← Back</button>
      <h1>{deck.title}</h1>

      <p>Card {currentIndex + 1} of {cards.length}</p>
      <div style={{backgroundColor: '#eee', borderRadius: '8px', height: '10px', margin: '10px 0'}}>
        <div style={{backgroundColor: '#4caf50', width: `${progress}%`, height: '10px', borderRadius: '8px'}}></div>
      </div>

      <div
        onClick={handleFlip}
        style={{
          border: '2px solid #ccc',
          borderRadius: '12px',
          padding: '40px',
          minHeight: '200px',
          cursor: 'pointer',
          textAlign: 'center',
          margin: '20px 0'
        }}
      >
        {isFlipped ? (
          <div>
            <p style={{color: '#888', fontSize: '14px'}}>EXPLANATION</p>
            <p>{card.explanation}</p>
          </div>
        ) : (
          <div>
            <p style={{color: '#888', fontSize: '14px'}}>TERM</p>
            <h2>{card.term}</h2>
            <p style={{color: '#aaa', fontSize: '13px'}}>click to flip</p>
          </div>
        )}
      </div>

      {isFlipped && (
        <div>
          <button onClick={() => handleAnswer(false)}>❌ Still learning</button>
          <button onClick={() => handleAnswer(true)}>✅ Known</button>
        </div>
      )}
    </div>
  )
}

export default Study