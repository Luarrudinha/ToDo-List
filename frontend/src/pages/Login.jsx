import { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(event) {
    event.preventDefault();
    fetch("http://localhost:3003/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    .then(async res => {
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user_id", data.id);
        localStorage.setItem("user_name", data.name);
        onLogin(data.id, data.name);
      } else {
        alert(data.message || "Erro ao logar");
      }
    })
    .catch(() => alert("Erro ao conectar com o servidor"));
  }

  return (
    <div className="auth-box">
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;