import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import './Auth.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const response = await api.post('/token/', { username, password })
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      navigate('/')
    } catch (err) {
      setError('Invalid username or password')
    }
  }

  return (
    <div className='auth-container'>
      <div className='auth-box'>
        <h1>Welcome back</h1>
        <p className='auth-subtitle'>Log in to your account</p>

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
        <button className='btn-primary' onClick={handleLogin}>Log In</button>
        <p className='auth-switch'>
          Don't have an account? <Link to='/register'>Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login