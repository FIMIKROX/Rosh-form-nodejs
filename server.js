const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.get("/", (req, res) => {
  res.send("Rosh Form Backend Chalu Hai Bhai 🔥")
})

app.post("/submit", (req, res) => {
  console.log("Form ka Data:", req.body)
  res.json({ success: true, message: "Data mil gaya bhai" })
})

app.listen(port, () => console.log(`Server running on ${port}`))