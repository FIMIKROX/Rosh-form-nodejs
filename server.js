const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static('public')) // ← Ye line important hai

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected 🔥'))
  .catch(err => console.log('DB Error:', err))

// Schema banaya
const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  course: String,
  message: String,
  date: { type: Date, default: Date.now }
})
const Form = mongoose.model('Form', formSchema)

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/public/index.html') // ← Form dikhega ab
})

app.post("/submit", async (req, res) => {
  try {
    const newForm = new Form(req.body)
    await newForm.save() // ← MongoDB mein save hoga
    console.log("Data saved:", req.body)
    res.json({ success: true, message: "Data MongoDB mein save ho gaya bhai" })
  } catch (err) {
    res.json({ success: false, message: "Error aa gaya" })
  }
})

app.listen(port, () => console.log(`Server running on ${port}`))
