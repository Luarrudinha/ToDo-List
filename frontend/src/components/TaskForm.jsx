//ARQUIVO DE CRIAR TAREFAS

import { useState } from "react";

function TaskForm({ loadTasks, userId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    
    // Verificação de segurança: se não tiver userId, não deixa enviar
    if (!userId) {
      alert("Erro: Usuário não identificado. Tente sair e entrar novamente.");
      return;
    }

    const novaTarefa = { 
      title: title, 
      description: description, 
      user_id: userId 
    };

    fetch("http://localhost:3003/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaTarefa)
    })
    .then((res) => {
      if (res.ok) {
        alert("Tarefa criada com sucesso!"); // Mensagem que você sentiu falta
        setTitle(""); // Limpa o campo de título
        setDescription(""); // Limpa o campo de descrição
        loadTasks(); // Força a lista lá embaixo a aparecer
      } else {
        alert("Erro ao salvar tarefa no servidor.");
      }
    })
    .catch((err) => {
      console.error("Erro na requisição:", err);
      alert("Erro de conexão. O servidor está ligado?");
    });
  }

  return (
    <div className="task-form-container">
      <h3>Criar nova tarefa</h3>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="O que precisa ser feito? (Título)" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          className="input-field"
        />
        <input 
          type="text" 
          placeholder="Detalhes (Descrição)" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="input-field"
        />
        <button type="submit" className="btn-add">Adicionar à Lista</button>
      </form>
    </div>
  );
}

export default TaskForm;