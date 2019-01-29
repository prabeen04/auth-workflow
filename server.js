const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const users = require('./routes/userRoute');
const cors = require('cors')
const { mongoURI } = require('./config/keys')
const Grid = require('gridfs-stream');
const app = express();
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/auth", { useNewUrlParser: true });
//Get the default connection
let db = mongoose.connection;
// Init gfs
let gfs;

db.once('open', () => {
  // Init stream
  gfs = Grid(db, mongoose.mongo);
  gfs.collection('auth/upload');
});

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(cors())

// body parser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}));
// @route GET /image/:filename
// @desc Display Image
app.get('/api/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
  
      // Check if image
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });
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