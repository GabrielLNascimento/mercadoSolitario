import { NavLink } from 'react-router-dom'
import './Menu.css'

export default function Menu() {
  return (
    <nav className="menu">
      <div className="menu-logo">
        <NavLink to="/" end className="logo-link">Mercado Solidário</NavLink>
      </div>
      <ul className="menu-links">
        <li>
          <NavLink to="/familias" className={({ isActive }) => isActive ? 'ativo' : ''}>
            Família
          </NavLink>
        </li>
        <li>
          <NavLink to="/estoque" className={({ isActive }) => isActive ? 'ativo' : ''}>
            Estoque
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
