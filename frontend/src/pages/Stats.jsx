import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import './Stats.css'

function Stats() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [sessions, setSessions] = useState([])
  const [cards, setCards] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [deckRes, sessionsRes, cardsRes] = await Promise.all([
      api.get(`/decks/${id}/`),
      api.get(`/sessions/?deck=${id}`),
      api.get(`/cards/?deck=${id}`)
    ])
    setDeck(deckRes.data)
    setSessions(sessionsRes.data)
    setCards(cardsRes.data)
  }

  if (!deck) return <p style={{ textAlign: 'center', marginTop: '60px' }}>Loading...</p>

  const totalCards = cards.length
  const knownCards = cards.filter(c => c.is_known).length
  const unknownCards = totalCards - knownCards
  const masteryPercent = totalCards > 0 ? Math.round((knownCards / totalCards) * 100) : 0
  const totalSessions = sessions.length
  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.score_percentage, 0) / sessions.length)
    : 0
  const dueCards = cards.filter(c => new Date(c.next_review) <= new Date()).length

  // Bar chart data — last 7 sessions
  const recentSessions = [...sessions].slice(0, 7).reverse()

  return (
    <div className='stats-page'>
      <button className='btn-nav-outline' onClick={() => navigate(`/decks/${id}`)}>← Back</button>
      <h1>{deck.title} — Statistics</h1>

      {/* Summary cards */}
      <div className='stats-grid'>
        <div className='stat-card'>
          <span className='stat-value'>{masteryPercent}%</span>
          <span className='stat-label'>Mastery</span>
        </div>
        <div className='stat-card'>
          <span className='stat-value'>{knownCards}/{totalCards}</span>
          <span className='stat-label'>Cards Known</span>
        </div>
        <div className='stat-card'>
          <span className='stat-value'>{dueCards}</span>
          <span className='stat-label'>Due for Review</span>
        </div>
        <div className='stat-card'>
          <span className='stat-value'>{totalSessions}</span>
          <span className='stat-label'>Total Sessions</span>
        </div>
        <div className='stat-card'>
          <span className='stat-value'>{avgScore}%</span>
          <span className='stat-label'>Avg Session Score</span>
        </div>
      </div>

      {/* Mastery bar */}
      <div className='stats-section'>
        <h2>Card Mastery</h2>
        <div className='mastery-bar-container'>
          <div className='mastery-bar'>
            <div
              className='mastery-bar-known'
              style={{ width: `${masteryPercent}%` }}
            >
              {masteryPercent > 10 && <span>{knownCards} known</span>}
            </div>
            <div
              className='mastery-bar-unknown'
              style={{ width: `${100 - masteryPercent}%` }}
            >
              {(100 - masteryPercent) > 10 && <span>{unknownCards} learning</span>}
            </div>
          </div>
          <div className='mastery-legend'>
            <span className='legend-known'>■ Known</span>
            <span className='legend-unknown'>■ Still learning</span>
          </div>
        </div>
      </div>

      {/* Session score chart */}
      {recentSessions.length > 0 && (
        <div className='stats-section'>
          <h2>Recent Session Scores</h2>
          <div className='bar-chart'>
            {recentSessions.map((session, index) => (
              <div className='bar-column' key={session.id}>
                <span className='bar-score'>{session.score_percentage}%</span>
                <div className='bar-track'>
                  <div
                    className='bar-fill'
                    style={{ height: `${session.score_percentage}%` }}
                  ></div>
                </div>
                <span className='bar-label'>
                  {new Date(session.started_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session history table */}
      <div className='stats-section'>
        <h2>Session History</h2>
        {sessions.length === 0 ? (
          <p className='empty-state-small'>No sessions yet — start studying to see your history!</p>
        ) : (
          <div className='sessions-table'>
            <div className='sessions-table-header'>
              <span>Date</span>
              <span>Cards Reviewed</span>
              <span>Score</span>
              <span>Duration</span>
            </div>
            {sessions.map(session => {
              const start = new Date(session.started_at)
              const end = session.completed_at ? new Date(session.completed_at) : null
              const duration = end ? Math.round((end - start) / 1000 / 60) : null
              return (
                <div className='sessions-table-row' key={session.id}>
                  <span>{start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>{session.cards_reviewed} cards</span>
                  <span className={`session-score ${session.score_percentage >= 70 ? 'good' : session.score_percentage >= 40 ? 'medium' : 'poor'}`}>
                    {session.score_percentage}%
                  </span>
                  <span>{duration !== null ? `${duration} min` : '—'}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Card difficulty breakdown */}
      <div className='stats-section'>
        <h2>Card Difficulty</h2>
        <div className='cards-difficulty-grid'>
          {cards.map(card => (
            <div
              key={card.id}
              className={`difficulty-card ${card.is_known ? 'known' : 'unknown'}`}
              title={`Interval: ${card.interval} days | Reviews: ${card.review_count}`}
            >
              <span className='difficulty-term'>{card.term}</span>
              <span className='difficulty-interval'>every {card.interval}d</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Stats