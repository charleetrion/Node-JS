require("dotenv").config(); 
const express = require("express");
const mysql = require("mysql2");

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
app.post("/users", (req, res) =>{
    const {name, lastname, email} = req.body;
    
    if (!name || !lastname || !email) {
        return res.status(400).json({ error: "Nombre, Apellido y correo son OBLIGATORIOS" });
    }

    const sql = "INSERT INTO users (name, lastname, email) VALUES (?, ?, ?)";
    db.query(sql, [name, lastname, email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Error al crear usuario"});
        }
        res.status(201).json({ id: results.insertId, name, lastname, email});
    });
 
});

// Eliminar usuarios 
app.delete("/users/:id", (req, res) =>{
    const userId = req.params.id;

    db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) =>{
        if (err) {
            return res.status(500).json({ error: "Error al eliminar usuario"});
        }
        res.json({ message: `Usuario con ID ${userId} eliminado`});
    });
});

// Init Server
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
})