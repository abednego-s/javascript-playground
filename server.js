const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const port = 8080

app.use(bodyParser.json())
app.use(express.static("dist"))

app.post("/exec", (req, res) => {
  res.send({ results: ["hello"] })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
})