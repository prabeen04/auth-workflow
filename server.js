const express = require('express');
const path = require('path');
// const crypto = require('crypto');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const routes = require('./routes/users');
// const postsroutes = require('./routes/posts');
const cors = require('cors')


// var passport = require("passport");
// var mongodbURL = require('./config/database.config')
// const authUserRoute = require('./routes/authUserRoute');

const app = express();
// var mongoURI = mongodbURL.mongodbURL;
// mongoose.Promise = global.Promise;
// mongoose.connect(mongoURI);

//Get the default connection
// var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// 


/////middlewares////
// cors middleware
app.use(cors())

// body parser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}));

// route handler middleware
// app.use('/api', [routes, postsroutes, todoRoutes, eventsRoutes/*, authUserRoute*/]);
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