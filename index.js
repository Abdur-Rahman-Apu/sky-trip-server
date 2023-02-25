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



    const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7kbtzra.mongodb.net/?retryWrites=true&w=majority`;

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


    const usersCollection = client.db('skyTrip').collection('users')

    // users 
    app.post('/users', async (req, res) => {
        const userInfo = req.body;
        const result = await usersCollection.insertOne(userInfo)
        res.send(result)
    })

    app.get('/user', async (req, res) => {
        const email = req.query.email;
        const result = await usersCollection.findOne({ email: email })

        res.send(result)
    })

    app.get('/users', async (req, res) => {

        const cursor = usersCollection.find({})
        const allUsers = await cursor.toArray()

        const company = allUsers.filter(user => user?.identity === 'Company')
        const user = allUsers.filter(user => user?.identity === 'User')


        res.send({
            company,
            user
        })
    })

    //delete user
    app.delete('/deleteUser/:id', async (req, res) => {
        const id = req.params.id
        console.log(id);
        const result = await usersCollection.deleteOne({ _id: new ObjectId(id) })
        res.send(result)
    })

}

run().catch(error => {
    console.log(error);
})