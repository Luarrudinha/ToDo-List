# ✅ To Do List API

Aplicação completa de gerenciamento de tarefas (To Do List), com backend, frontend e banco de dados, containerizada com Docker.

---

## 🚀 Funcionalidades

* 👤 Cadastro de usuários
* 🔐 Autenticação de usuário
* ➕ Criar tarefas
* 📝 Editar tarefas
* ❌ Excluir tarefas
* 📋 Listar tarefas por usuário

---

## 🛠️ Tecnologias utilizadas

### 🔙 Backend

* Node.js
* Express
* Sequelize

### 🎨 Frontend

* React
* JavaScript

### 🗄️ Banco de dados

* MySQL

### 🐳 DevOps

* Docker
* Docker Compose

---

## 📦 Arquitetura do projeto

O projeto é dividido em:

* `frontend` → interface do usuário
* `backend` → API REST
* `database` → banco MySQL
* `docker-compose.yml` → orquestração dos containers

---

## 🔗 Principais rotas da API

### 👤 Usuários

* `POST /users` → criar usuário
* `GET /users` → listar usuários

### ✅ Tarefas

* `POST /tasks` → criar tarefa
* `GET /tasks` → listar tarefas
* `PUT /tasks/:id` → editar tarefa
* `DELETE /tasks/:id` → excluir tarefa

---

## 🔐 Segurança

* Senhas criptografadas (bcrypt)
* Separação de responsabilidades (API + banco)

---


## 📌 Status

✅ Projeto funcional

---

## 👩‍💻 Autor

Desenvolvido por Luana Arruda
