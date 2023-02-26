const express = require('express');

const app = express()

const cors = require('cors');

app.use(cors())

app.use(express.json())

require('dotenv').config()

const port = process.env.PORT || 5000

var jwt = require('jsonwebtoken');

app.get('/', async (req, res) => {
    res.send("Server is running")
})

app.listen(port, async () => {
    console.log("Server is running on port", port);
})


function verifyJWT(req, res, next) {
    const authHeader = req.header.authorization
    if (!authHeader) {
        return res.status(401).send({ "message": "Unauthorized access" })
    }

    const token = authHeader.split('')[1]

    wt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(401).send({ "message": "Unauthorized access" })
        }

        req.decoded = decoded
        next();
    });
}

async function run() {

    const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7kbtzra.mongodb.net/?retryWrites=true&w=majority`;

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


    const usersCollection = client.db('skyTrip').collection('users')
    const flightCollection = client.db('skyTrip').collection('flights')
    const bookCollection = client.db('skyTrip').collection('book')

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


    //jwt

    app.post('/jwt', async (req, res) => {


        const email = req.body;

        console.log(email);

        var token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '24h' });

        res.send({ token })
    })

    //addFlight
    app.post('/addFlight', async (req, res) => {
        const flightInfo = req.body;
        const result = await flightCollection.insertOne(flightInfo)
        res.send(result)
    })

    //getSpecificCompanyFlight
    app.get('/showAllFlight', async (req, res) => {

        const email = req.query.email;
        const cursor = flightCollection.find({ companyEmail: email })
        const result = await cursor.toArray()
        res.send(result)
    })

    // delete flight 

    app.delete('/deleteFlight/:id', async (req, res) => {
        const id = req.params.id;

        const result = await flightCollection.deleteOne({ _id: new ObjectId(id) })

        res.send(result)
    })

    //getAllFlight
    app.get('/allFlight', async (req, res) => {
        const cursor = flightCollection.find({})
        const result = await cursor.toArray()
        res.send(result)
    })

    //book flight
    app.post('/bookFlight', async (req, res) => {
        const flightInfo = req.body;
        const result = await bookCollection.insertOne(flightInfo)

        const findFlight = await flightCollection.findOne({ _id: new ObjectId(flightInfo?.flightId) })

        const availableSeat = parseInt(findFlight?.seats) - parseInt(flightInfo?.seat)

        console.log(availableSeat);
        const updateDoc = {
            $set: {
                seats: availableSeat
            }
        }

        const updateFlight = await flightCollection.updateOne({ _id: new ObjectId(flightInfo?.flightId) }, updateDoc)

        res.send(result)
    })



    //get specific user booked items
    app.get('/booked', async (req, res) => {
        const email = req.query.email;
        const cursor = bookCollection.find({ buyerEmail: email })
        const result = await cursor.toArray()
        res.send(result)
    })

    //get specific flight info 
    app.get('/flight/:id', async (req, res) => {
        const id = req.params.id;

        const findFlight = await flightCollection.findOne({ _id: new ObjectId(id) })
        res.send(findFlight)
    })

    //delete from cart
    app.delete('/deleteFromCart', async (req, res) => {
        const bookId = req.query.bookId
        const flightId = req.query.flightId

        const bookItem = await bookCollection.findOne({ _id: new ObjectId(bookId) })
        const bookSeat = parseInt(bookItem.seat);

        const flightItem = await flightCollection.findOne({ _id: new ObjectId(flightId) })

        const flightSeat = parseInt(flightItem.seats)

        const amountOfSeat = flightSeat + bookSeat

        const updateSeat = {
            $set: {
                seats: amountOfSeat
            }
        }

        const updateFlightInfo = await flightCollection.updateOne({ _id: new ObjectId(flightId) }, updateSeat)

        const deleteBook = await bookCollection.deleteOne({ _id: new ObjectId(bookId) })

        res.send(deleteBook)
    })
}

run().catch(error => {
    console.log(error);
})