import { useNavigate } from 'react-router-dom'
import './Auth.css'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className='auth-page'>
      <div className='auth-hero'>
        <h1>Create flashcards</h1>
        <p>Studying with us is easy!</p>
      </div>
      <footer className='auth-footer'>
        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2z' />
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 8.5v7m-3.5-3.5h7' />
        </svg>
        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
        </svg>
      </footer>
    </div>
  )
}

export default Landing