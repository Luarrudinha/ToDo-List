import { useState, useEffect } from "react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TaskForm from "./components/TaskForm";

const API_URL = "https://todo-list-api-fi3q.onrender.com/v1";
type Task = {
  id: number;
  title: string;
  description: string;
  completed: number;
};

function App() {
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("user_id"));
  const [userName, setUserName] = useState<string | null>(localStorage.getItem("user_name"));
  const [showRegister, setShowRegister] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  

  // 1. Busca tarefas filtrando pelo ID do usuário logado
  function loadTasks() {
    if (!userId) return;
    fetch(`http://localhost:3003/tasks?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Erro ao carregar tarefas:", err));
  }

  useEffect(() => {
    loadTasks();
  }, [userId]);

  // 2. Função para EXCLUIR
  function deleteTask(id: number) {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      fetch(`http://localhost:3003/tasks/${id}`, { method: "DELETE" })
        .then(() => loadTasks())
        .catch((err) => console.error(err));
    }
  }

  // 3. Função para o CHECKBOX (concluir)
  function toggleTask(task: Task) {
    fetch(`http://localhost:3003/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: task.completed ? 0 : 1 }),
    })
      .then(() => loadTasks())
      .catch((err) => console.error(err));
  }

  // 4. Função para EDITAR (Lápis)
  function editTask(task: Task) {
    const novoTitulo = prompt("Edite o título da tarefa:", task.title);
    const novaDescricao = prompt("Edite a descrição:", task.description);

    if (novoTitulo) {
      fetch(`http://localhost:3003/tasks/${task.id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: novoTitulo, description: novaDescricao }),
      })
      .then(() => loadTasks())
      .catch((err) => console.error(err));
    }
  }

  function handleLogout() {
    localStorage.clear();
    setUserId(null);
    setUserName(null);
  }

  // --- TELA DE LOGIN / CADASTRO ---
  if (!userId) {
    return (
      <div className="App auth-container">
        <div className="auth-box">
          {!showRegister ? (
            <>
              <h1>Login</h1>
              <Login onLogin={(id, name) => {
                setUserId(id);
                setUserName(name);
              }} />
              <p>Ainda não tem conta?</p>
              <button className="btn-link" onClick={() => setShowRegister(true)}>
                Criar nova conta (Cadastro)
              </button>
            </>
          ) : (
            <>
              <h1>Cadastro</h1>
              <Register 
                onRegister={(id, name) => {
                  setUserId(id);
                  setUserName(name);
                }} 
                onBack={() => setShowRegister(false)} 
              />
            </>
          )}
        </div>
      </div>
    );
  }

  // --- TELA PRINCIPAL (DASHBOARD) ---
  return (
    <div className="App">
      <header className="main-header">
        <h1>Minhas Tarefas</h1>
        <div className="user-info">
          <span>Bem-vinda, <strong>{userName || "Usuária"}</strong>!</span>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <main className="content-container">
        <TaskForm loadTasks={loadTasks} userId={userId} />

        <div className="task-list">
          {tasks.length === 0 ? (
            <p className="empty-msg">Nenhuma tarefa encontrada. Comece criando uma!</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className={`task-item ${task.completed ? "done" : ""}`}>
                <div className="task-content">
                  <input
                    type="checkbox"
                    checked={task.completed === 1}
                    onChange={() => toggleTask(task)}
                  />
                  <div className="text-wrapper">
                    <h3 className={task.completed ? "strikethrough" : ""}>
                      {task.title}
                    </h3>
                    <p>{task.description}</p>
                  </div>
                </div>
                
                <div className="task-actions">
                  <button className="btn-edit" onClick={() => editTask(task)} title="Editar">
                    ✏️
                  </button>
                  <button className="btn-delete" onClick={() => deleteTask(task.id)} title="Excluir">
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;