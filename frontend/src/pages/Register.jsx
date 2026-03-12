import { useState } from "react";

function Register({ onRegister, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleRegister(event) {
    event.preventDefault();
    
    // Objeto com os dados para conferirmos no console (F12)
    const userData = { name, email, password };
    console.log("Tentando cadastrar:", userData);

    fetch("http://localhost:3003/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData) 
    })
    .then(async (res) => {
      // Se o servidor responder erro (ex: email duplicado)
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro no servidor");
      }
      return res.json();
    })
    .then((data) => {
      // Se chegou aqui, o banco criou o usuário (vimos na sua foto que está criando!)
      alert("Conta criada com sucesso!");
      
      // Salva no navegador para o App.tsx usar
      localStorage.setItem("user_id", data.id);
      localStorage.setItem("user_name", name);
      
      // Avisa o App.tsx que estamos logados
      onRegister(data.id); 
    })
    .catch((err) => {
      console.error("Erro no cadastro:", err);
      alert("Erro: " + err.message);
    });
  }

  return (
    <div className="auth-box">
      <h2>Criar Nova Conta</h2>
      <form onSubmit={handleRegister}>
        {/* Campo de Nome: O banco de dados exige este campo! */}
        <input 
          type="text" 
          placeholder="Nome Completo" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
        />
        
        <input 
          type="email" 
          placeholder="E-mail" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        
        <input 
          type="password" 
          placeholder="Senha" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        
        <button type="submit" style={{ backgroundColor: "#007bff", color: "white" }}>
          Cadastrar
        </button>
        
        <button 
          type="button" 
          onClick={onBack} 
          style={{ marginTop: "10px", backgroundColor: "#6c757d", color: "white" }}
        >
          Voltar para o Login
        </button>
      </form>
    </div>
  );
}

export default Register;