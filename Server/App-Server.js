require("dotenv").config(); 
const express = require("express");
const mysql = require("mysql2");
const validateUser = require("./middlewares/validationMiddleware");
const { param } = require("express-validator");
const { validationResult } = require("express-validator");

const app = express();
const port =  process.env.PORT || 3000;

app.use(express.json());

// Configurar la conexión a MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Conectar a MySQL
db.connect(err => {
    if (err) {
        console.error("❌ Error al conectar a MySQL:", err);
        return;
    }
    console.log("✅ Conectado a MySQL");
})


// Ruta principal 
app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente 🚀")
})


// Rutas para obtener usuarios MySQL.
app.get("/users", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Error al obtener usuarios"});
        }
        res.json(results);
    });
});

// Crear usuarios 
app.post("/users", validateUser, (req, res) => {
    const { name, lastname, email } = req.body;

    // Verificar si el correo ya existe
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Error al verificar el correo" });
        }
        if (results.length > 0) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        // Insertar usuario si no existe
        const insertUserQuery = "INSERT INTO users (name, lastname, email) VALUES (?, ?, ?)";
        db.query(insertUserQuery, [name, lastname, email], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Error al crear usuario" });
            }
            res.status(201).json({ 
                message: "Usuario creado exitosamente",
                id: result.insertId, 
                name, 
                lastname, 
                email 
            });
        });
    });
});
 
// Eliminar usuarios con verificación previa
app.delete("/users/:id", (req, res) => {
    const userId = req.params.id;

    // Verificar si el usuario existe antes de eliminar
    db.query("SELECT * FROM users WHERE id = ?", [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Error al verificar usuario" });
        }

        // Si no existe el usuario, devolver error 404
        if (results.length === 0) {
            return res.status(404).json({ error: `No se encontró un usuario con ID ${userId}` });
        }

        // Si existe, proceder a eliminarlo
        db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Error al eliminar usuario" });
            }
            res.json({ message: `Usuario con ID ${userId} eliminado` });
        });
    });
});

// Init Server
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
})