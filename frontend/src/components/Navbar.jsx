import { useNavigate, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuth = location.pathname === '/login' || location.pathname === '/register'
  const isLoggedIn = !!localStorage.getItem('access_token')

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  return (
    <nav className='navbar'>
      <div className='navbar-left' onClick={() => navigate(isLoggedIn ? '/' : '/landing')} style={{cursor: 'pointer'}}>
        <img src='/owl.png' alt='Learner logo' className='navbar-logo' />
        <span className='navbar-brand'>Learner</span>
      </div>
      <div className='navbar-right'>
        {isAuth ? (
          <>
            <button className='btn-nav-outline' onClick={() => navigate('/login')}>Sign in</button>
            <button className='btn-nav-solid' onClick={() => navigate('/register')}>Register</button>
          </>
        ) : isLoggedIn ? (
          <>
            <button className='btn-nav-solid' onClick={() => navigate('/')}>Home</button>
            <button className='btn-nav-outline' onClick={handleLogout}>Log out</button>
          </>
        ) : null}
      </div>
    </nav>
  )
}

export default Navbar