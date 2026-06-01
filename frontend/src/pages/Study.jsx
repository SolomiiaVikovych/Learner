import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import './Study.css'

function Study() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [finished, setFinished] = useState(false)
  const [shuffled, setShuffled] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const deckResponse = await api.get(`/decks/${id}/`)
    const cardsResponse = await api.get(`/cards/?deck=${id}`)
    setDeck(deckResponse.data)
    setCards(cardsResponse.data)
  }

  const toggleShuffle = () => {
    if (!shuffled) {
      setCards(prev => [...prev].sort(() => Math.random() - 0.5))
    } else {
      setCards(prev => [...prev].sort((a, b) => a.id - b.id))
    }
    setShuffled(!shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
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

  if (!deck || cards.length === 0) return <p style={{textAlign:'center', marginTop:'60px'}}>Loading...</p>

  if (finished) {
    return (
      <div className='finished-screen'>
        <h1>Session Complete! 🎉</h1>
        <p>You went through all {cards.length} cards.</p>
        <div className='finished-actions'>
          <button className='btn-dont-know' onClick={() => navigate(`/decks/${id}`)}>Back to Deck</button>
          <button className='btn-know' onClick={() => navigate('/')}>Home</button>
        </div>
      </div>
    )
  }

  const card = cards[currentIndex]
  const progress = Math.round((currentIndex / cards.length) * 100)

  return (
    <div className='study-page'>
      <h1>{deck.title}</h1>

      <div className='study-progress'>
        <p>Card {currentIndex + 1} of {cards.length}</p>
        <div className='progress-bar-track'>
          <div className='progress-bar-fill' style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className='study-controls'>
        <button className='btn-nav-outline' onClick={() => navigate(`/decks/${id}`)}>← Back</button>
        <button className={`btn-shuffle ${shuffled ? 'active' : ''}`} onClick={toggleShuffle}>
          🔀 {shuffled ? 'Shuffled' : 'Shuffle'}
        </button>
      </div>

      <div className='flashcard-term' onClick={() => setIsFlipped(!isFlipped)}>
        <h2>{card.term}</h2>
        <p>tap to flip the card</p>
      </div>

      {isFlipped && (
        <div className='flashcard-explanation'>
          <p>{card.explanation}</p>
        </div>
      )}

      {isFlipped && (
        <div className='answer-buttons'>
          <button className='btn-dont-know' onClick={() => handleAnswer(false)}>Don't know</button>
          <button className='btn-know' onClick={() => handleAnswer(true)}>Know</button>
        </div>
      )}
    </div>
  )
}

export default Study