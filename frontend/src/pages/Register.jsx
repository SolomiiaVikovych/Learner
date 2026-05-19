import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import './Auth.css'

function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      await api.post('/register/', { username, password })
      navigate('/login')
    } catch (err) {
      setError('Registration failed. Username may already be taken.')
    }
  }

  return (
    <div className='auth-container'>
      <div className='auth-box'>
        <h1>Create account</h1>
        <p className='auth-subtitle'>Start learning today</p>

        {error && <p className='auth-error'>{error}</p>}

        <input
          type='text'
          placeholder='Username'
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className='btn-primary' onClick={handleRegister}>Register</button>
        <p className='auth-switch'>
          Already have an account? <Link to='/login'>Log In</Link>
        </p>
      </div>
    </div>
  )
}

export default Register