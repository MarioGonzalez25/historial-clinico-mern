// frontend/src/pages/ForgotPassword.jsx
import { useState } from 'react'

const API = import.meta.env.VITE_API_URL

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMsg('Enviando...')
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error')

      let text = 'Si el correo existe, te enviamos un enlace. Revisa tu bandeja.'
      if (data.debug?.resetLink) text += ` (Dev: ${data.debug.resetLink})`
      setMsg(text)
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div className="container">
      <h2>¿Olvidaste tu contraseña?</h2>
      <p>Escribe tu correo y te enviaremos un enlace para restablecerla.</p>
      <form onSubmit={submit}>
        <label>Correo</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@ejemplo.com"
        />
        <button type="submit">Enviar enlace</button>
      </form>
      <div className="msg">{msg}</div>
      <small>El enlace es válido por pocos minutos.</small>
    </div>
  )
}
