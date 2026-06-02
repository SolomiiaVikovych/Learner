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
  const [sessionId, setSessionId] = useState(null)
  const [knownCount, setKnownCount] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const deckResponse = await api.get(`/decks/${id}/`)
    const cardsResponse = await api.get(`/cards/?deck=${id}`)
    setDeck(deckResponse.data)

    // Sort cards so due cards come first
    const sorted = [...cardsResponse.data].sort((a, b) => {
      return new Date(a.next_review) - new Date(b.next_review)
    })
    setCards(sorted)

    // Create a new study session when study starts
    const sessionResponse = await api.post('/sessions/', { deck: id })
    setSessionId(sessionResponse.data.id)
  }

  const toggleShuffle = () => {
    if (!shuffled) {
      setCards(prev => [...prev].sort(() => Math.random() - 0.5))
    } else {
      setCards(prev => [...prev].sort((a, b) => new Date(a.next_review) - new Date(b.next_review)))
    }
    setShuffled(!shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const handleAnswer = async (known) => {
    const card = cards[currentIndex]

    // Call the review endpoint — this runs the spaced repetition algorithm
    await api.patch(`/cards/${card.id}/review/`, { known })

    const newKnownCount = known ? knownCount + 1 : knownCount
    setKnownCount(newKnownCount)

    const nextIndex = currentIndex + 1
    if (nextIndex >= cards.length) {
      // Complete the session with final stats
      await api.patch(`/sessions/${sessionId}/complete/`, {
        cards_reviewed: cards.length,
        cards_known: newKnownCount
      })
      setFinished(true)
    } else {
      setCurrentIndex(nextIndex)
      setIsFlipped(false)
    }
  }

  if (!deck || cards.length === 0) return <p style={{ textAlign: 'center', marginTop: '60px' }}>Loading...</p>

  if (finished) {
    const scorePercent = Math.round((knownCount / cards.length) * 100)
    return (
      <div className='finished-screen'>
        <h1>Session Complete! 🎉</h1>
        <p>You went through all {cards.length} cards.</p>
        <div className='finished-score'>
          <span className='score-number'>{scorePercent}%</span>
          <span className='score-label'>{knownCount} of {cards.length} known</span>
        </div>
        <div className='finished-actions'>
          <button className='btn-dont-know' onClick={() => navigate(`/decks/${id}`)}>Back to Deck</button>
          <button className='btn-know' onClick={() => navigate('/')}>Home</button>
        </div>
      </div>
    )
  }

  const card = cards[currentIndex]
  const progress = Math.round((currentIndex / cards.length) * 100)
  const isDue = new Date(card.next_review) <= new Date()

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
        <div className='study-controls-right'>
          {isDue && <span className='due-badge'>Due for review</span>}
          <button className={`btn-shuffle ${shuffled ? 'active' : ''}`} onClick={toggleShuffle}>
            🔀 {shuffled ? 'Shuffled' : 'Shuffle'}
          </button>
        </div>
      </div>

      <div className='flashcard-wrapper' onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
          <div className='flashcard-front'>
            <h2>{card.term}</h2>
            <p>tap to flip the card</p>
          </div>
          <div className='flashcard-back'>
            <p className='explanation-text'>{card.explanation}</p>
            <p>tap to flip back</p>
          </div>
        </div>
      </div>

      {isFlipped && (
        <div className='answer-buttons'>
          <button className='btn-dont-know' onClick={(e) => { e.stopPropagation(); handleAnswer(false) }}>Don't know</button>
          <button className='btn-know' onClick={(e) => { e.stopPropagation(); handleAnswer(true) }}>Know</button>
        </div>
      )}
    </div>
  )
}

export default Study