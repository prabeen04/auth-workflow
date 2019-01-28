const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const users = require('./routes/userRoute');
const cors = require('cors')
const { mongoURI } = require('./config/keys')
const app = express();
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/auth", { useNewUrlParser: true });
//Get the default connection
let db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(cors())

// body parser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}));
app.get('/api/hello', (req, res) => {
    res.send({ express: 'Hello From Express' });
});
// route handler middleware
app.use('/api', [users]);

// error handling middleware
app.use(function (err, req, res, next) {
    if (err) {
        console.log(err)
        console.log('inside error handler middle ware')
        res.send(err.message);
    }
    next();
})
app.get('/', function (req, res) {
    res.send('Go to /api/ to connect to the restAPI');
});

const port = process.env.PORT || 8080
app.listen(port, function () {
    console.log(`server started at port ${port}`);
});