const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true })) // form data ke liye zaroori
app.use(express.static('public'))
app.use(cookieParser())

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected 🔥'))
  .catch(err => console.log('DB Error:', err))

// Form Schema
const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  course: String,
  message: String,
  date: { type: Date, default: Date.now }
})
const Form = mongoose.model('Form', formSchema)

// Admin Schema - login ke liye
const adminSchema = new mongoose.Schema({
  username: String,
  password: String
})
const Admin = mongoose.model('Admin', adminSchema)

// JWT Middleware - Token check karega
const verifyToken = (req, res, next) => {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ error: 'Login karo pehle' })

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token galat hai' })
    req.admin = decoded
    next()
  })
}

// ==================== ROUTES ====================

// Home Page
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

// Admin Panel Page - admin.html serve karega
app.get("/admin", (req, res) => {
  res.sendFile(__dirname + '/public/admin.html')
})

// Check karo user logged in hai ya nahi - frontend ke liye
app.get("/api/admin/check", verifyToken, (req, res) => {
  res.json({ loggedIn: true })
})

// Data bhejne ka API - JWT protected
app.get("/api/admin/data", verifyToken, async (req, res) => {
  try {
    const allForms = await Form.find().sort({ date: -1 })
    res.json(allForms)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Login Logic - JSON response dega
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body
  const admin = await Admin.findOne({ username })
  
  if (!admin) return res.status(400).json({ error: 'User nahi mila' })
  
  const validPass = await bcrypt.compare(password, admin.password)
  if (!validPass) return res.status(400).json({ error: 'Password galat hai' })
  
  // Token banao
  const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
  res.cookie('token', token, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Railway pe HTTPS hai
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 din
  })
  res.json({ success: true })
})

// Logout
app.get("/admin/logout", (req, res) => {
  res.clearCookie('token')
  res.json({ success: true })
})

// TEMP ROUTE - Admin banane ke liye. Ek baar use karke DELETE kar dena
app.get("/create-admin", async (req, res) => {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' })
    if (adminExists) return res.send('Admin already exists. Route delete kar de.')
    
    const hashedPass = await bcrypt.hash(process.env.ADMIN_PASS, 10)
    const admin = new Admin({ username: 'admin', password: hashedPass })
    await admin.save()
    res.send('Admin ban gaya. Username: admin. Ab ye /create-admin route code se delete kar de.')
  } catch (err) {
    res.send('Error: ' + err.message)
  }
})

// Form Submit
app.post("/submit", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB connected nahi hai")
    }
    const newForm = new Form(req.body)
    await newForm.save()
    res.json({ success: true, message: "Data MongoDB mein save ho gaya bhai" })
  } catch (err) {
    res.json({ success: false, message: "Error: " + err.message })
  }
})

app.listen(port, () => console.log(`Server running on ${port}`))
