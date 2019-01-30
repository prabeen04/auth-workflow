const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const { mongoURI } = require('../config/keys')

//Get the default connection
let conn = mongoose.createConnection("mongodb://localhost:27017/auth");
// Init gfs
let gfs;

conn.once('open', () => {
    console.log('database connection successfull')
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

const storage = new GridFsStorage({
    url: 'mongodb://localhost:27017/auth',
    file: (req, file) => {
        if (file.mimetype === 'image/jpeg' || 'image/jpg' || 'image/png') {
            return {
                filename: 'image_' + Date.now() + path.extname(file.originalname),
                bucketName: 'uploads'
            };
        } else {
            return null;
        }
    }
});
const upload = multer({ storage })

//upload an image
router.post('/upload', upload.single('avatar'), function (req, res, next) {
    res.status(200).send(req.file.filename)
})

// get image stream
router.get('/image/:filename', (req, res) => {
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

module.exports = router;