const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");


const app = express();
app.use(cors());
app.use(express.json());

function connectDatabase() {
  const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

  db.connect((err) => {
    if (err) {
      console.log("MySQL ainda não está pronto. Tentando novamente em 5s...");
      setTimeout(connectDatabase, 5000);
      return;
    }

    console.log("✅ Conectado ao MySQL!");
  });

  return db;
}

const db = connectDatabase();

module.exports = db;


// --- Rota de Cadastro (Register) ---

app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 👇 criptografa a senha
    const senhaCriptografada = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(sql, [name, email, senhaCriptografada], (err, result) => {
      if (err) {
        console.error("Erro no banco:", err);
        return res.status(500).json({ message: "Erro ao salvar usuário" });
      }

      res.json({ id: result.insertId, name });
    });

  } catch (erro) {
    console.error("Erro ao criptografar:", erro);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// --- Rota de Login (Ajustada para retornar o Nome) ---
// No seu server.js

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // 🔹 busca o usuário só pelo email
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).send(err);

    // usuário não encontrado
    if (result.length === 0) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const usuario = result[0];

    try {
      // 🔹 compara senha digitada com a do banco
      const senhaCorreta = await bcrypt.compare(password, usuario.password);

      if (!senhaCorreta) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // 🔹 login ok
      res.json({
        id: usuario.id,
        name: usuario.name
      });

    } catch (erro) {
      res.status(500).json({ message: "Erro ao verificar senha" });
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

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});