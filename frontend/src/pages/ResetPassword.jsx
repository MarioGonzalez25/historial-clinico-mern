// frontend/src/pages/ResetPassword.jsx
import { useSearchParams, Link } from 'react-router-dom'
import { useState } from 'react'

const API = import.meta.env.VITE_API_URL

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMsg('Procesando...')
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error')
      setMsg('¡Listo! Contraseña actualizada. Ya puedes iniciar sesión.')
      setPassword('')
    } catch (err) {
      setMsg(err.message)
    }
  }

  if (!token) {
    return (
      <div className="container">
        <h2>Token no encontrado</h2>
        <p>Vuelve a solicitar el enlace o revisa el correo.</p>
        <Link to="/">Volver</Link>
      </div>
    )
  }

  return (
    <div className="container">
      <h2>Restablecer contraseña</h2>
      <form onSubmit={submit}>
        <label>Nueva contraseña</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
        />
        <button type="submit">Guardar</button>
      </form>
      <div className={`msg ${msg.includes('¡Listo!') ? 'ok' : msg ? 'err' : ''}`}>{msg}</div>
    </div>
  )
}
