
// server.js - Backend recuperación contraseña
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yary_nails", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Mongo conectado"))
.catch(err => console.error(err));

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  resetToken: String,
  resetExpires: Date
});
const User = mongoose.model("User", userSchema);

// Transportador de correos
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ message: "Si existe una cuenta, se envió el enlace." });

  const token = Math.random().toString(36).substring(2);
  user.resetToken = token;
  user.resetExpires = Date.now() + 3600000;
  await user.save();

  const resetUrl = `http://localhost:3000/reset-password.html?token=${token}&email=${email}`;
  await transporter.sendMail({
    from: '"Yary Nails 💅" <no-reply@yarynails.com>',
    to: email,
    subject: "Recuperar contraseña",
    html: `<p>Haz clic para restablecer tu contraseña:</p><a href="${resetUrl}">${resetUrl}</a>`
  });

  res.json({ message: "Correo enviado (revisa consola si usas Ethereal)." });
});

app.post("/api/reset-password", async (req, res) => {
  const { email, token, password } = req.body;
  const user = await User.findOne({ email, resetToken: token, resetExpires: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: "Token inválido o expirado." });

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetExpires = null;
  await user.save();
  res.json({ message: "Contraseña actualizada correctamente." });
});

app.listen(3000, () => console.log("Servidor activo en http://localhost:3000"));
