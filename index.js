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

async function run() {



    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7kbtzra.mongodb.net/?retryWrites=true&w=majority`;

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


    const usersCollection = client.db('skyTrip').collection('users')


    app.post('/users', async (req, res) => {
        const userInfo = req.body;
        console.log(userInfo);
        const result = await usersCollection.insertOne(userInfo)
        res.send(result)
    })

}

run().catch(error => {
    console.log(error);
})