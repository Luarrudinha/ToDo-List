const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "123456", // Verifique se sua senha é essa mesmo
  database: "meubanco",
});



// --- Rota de Cadastro (Register) ---
app.post("/users", (req, res) => {
  const { name, email, password } = req.body; // O 'name' deve estar aqui!
  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.error("Erro no Banco:", err); // Isso vai mostrar o erro no terminal
      return res.status(500).json({ message: "Erro ao salvar no banco", error: err });
    }
    res.json({ id: result.insertId, name });
  });
});



// --- Rota de Login (Ajustada para retornar o Nome) ---
// No seu server.js
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT id, name FROM users WHERE email = ? AND password = ?";
  
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length > 0) {
      // Importante: enviar o ID e o NOME para o frontend
      res.json({ id: result[0].id, name: result[0].name });
    } else {
      res.status(401).json({ message: "Credenciais inválidas" });
    }
  });
});



// --- Rotas de Tarefas (Tasks) ---
app.post("/tasks", (req, res) => {
  const { title, description, user_id } = req.body;
  const sql = "INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)";
  db.query(sql, [title, description, user_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId });
  });
});

app.get("/tasks", (req, res) => {
  const user_id = req.query.user_id;
  const sql = "SELECT * FROM tasks WHERE user_id=?";
  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

//atualizar tarefa (checkbox)
app.put("/tasks/:id", (req, res) => {
  const id = req.params.id;
  // Forçamos a conversão para número para o MySQL não se confundir
  const completed = Number(req.body.completed); 

  console.log(`Recebido PUT para tarefa ${id}. Novo status: ${completed}`);

  const sql = "UPDATE tasks SET completed = ? WHERE id = ?";

  db.query(sql, [completed, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar no MySQL:", err);
      return res.status(500).json(err);
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    res.json({ message: "Tarefa atualizada com sucesso" });
  });
});

// Rota para EXCLUIR uma tarefa
app.delete("/tasks/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM tasks WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Erro ao excluir no banco:", err);
      return res.status(500).json(err);
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    res.json({ message: "Tarefa excluída com sucesso!" });
  });
});

// Rota para EDITAR o texto da tarefa
app.put("/tasks/:id/edit", (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const sql = "UPDATE tasks SET title = ?, description = ? WHERE id = ?";
  db.query(sql, [title, description, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Tarefa editada com sucesso!" });
  });
});

app.listen(3003, () => console.log("Servidor rodando em http://localhost:3003"));