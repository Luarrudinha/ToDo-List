const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const API_PREFIX = "/v1";
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs"); // ✅ correto
const path = require("path");

//const swaggerDocument = YAML.load( path.join(__dirname, "swagger.yaml"));

const app = express();
app.use(cors());
app.use(express.json());

//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- Configuração do Banco de Dados ---
function connectDatabase() {
  const db = mysql.createConnection({
    host: process.env.DB_HOST || 'mysql', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'meubanco',
    port: process.env.DB_PORT || 3306
  });

  db.connect((err) => {
    if (err) {
      console.log("❌ Erro ao conectar no MySQL:", err.message);
      return;
    }

    console.log("✅ Conectado ao MySQL!");
  });

  return db;
}
const db = connectDatabase();

// --- Rota de Teste ---
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

// --- Rota de Cadastro ---
app.post(`${API_PREFIX}/users`, async (req, res) => {
  const { name, email, password } = req.body;
  if (!db) return res.status(503).json({ message: "Banco de dados em inicialização..." });

  try {
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
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// --- Rota de Login ---
app.post(`${API_PREFIX}/login`, (req, res) => {
  const { email, password } = req.body;
  if (!db) return res.status(503).json({ message: "Banco de dados offline" });

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(401).json({ message: "Credenciais inválidas" });

    const usuario = result[0];
    try {
      const senhaCorreta = await bcrypt.compare(password, usuario.password);
      if (!senhaCorreta) return res.status(401).json({ message: "Credenciais inválidas" });
      res.json({ id: usuario.id, name: usuario.name });
    } catch (erro) {
      res.status(500).json({ message: "Erro ao verificar senha" });
    }
  });
});

app.get(`${API_PREFIX}/users`, (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// --- Rotas de Tarefas (Tasks) ---
app.post(`${API_PREFIX}/tasks`, (req, res) => {
  const { title, description, user_id } = req.body;

  const sql = `
    INSERT INTO tasks (title, description, user_id)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [title, description, user_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get(`${API_PREFIX}/tasks`, (req, res) => {
  const user_id = req.query.user_id;

  console.log("🔥 user_id recebido:", user_id);

  const sql = "SELECT * FROM tasks WHERE user_id = ?";

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.log("❌ ERRO SQL:", err);
      return res.status(500).json(err);
    }

    console.log("✅ tarefas filtradas:", results);
    res.json(results);
  });
});


app.get(`${API_PREFIX}/tasks/:id`, (req, res) => {
  const { id } = req.params;
  const user_id = req.query.user_id;

  if (!user_id) {
    return res.status(400).json({ message: "user_id é obrigatório" });
  }

  const sql = "SELECT * FROM tasks WHERE id = ? AND user_id = ?";

  db.query(sql, [id, user_id], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    res.json(results[0]);
  });
});


app.put(`${API_PREFIX}/tasks/:id`, (req, res) => {
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
app.delete(`${API_PREFIX}/tasks/:id`, (req, res) => {
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


app.put(`${API_PREFIX}/tasks/:id/edit`, (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const sql = "UPDATE tasks SET title = ?, description = ? WHERE id = ?";
  db.query(sql, [title, description, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Editada!" });
  });
});

// --- Inicialização do Servidor ---
const PORT = process.env.PORT || 3003;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});