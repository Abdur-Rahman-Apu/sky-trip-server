const express = require('express');

const app = express()

const cors = require('cors');

app.use(cors())

app.use(express.json())

require('dotenv').config()

const port = process.env.PORT || 5000

app.get('/', async (req, res) => {
    res.send("Server is running")
})

app.listen(port, async () => {
    console.log("Server is running on port", port);
})