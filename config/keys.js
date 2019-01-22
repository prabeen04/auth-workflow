const mongoURI = process.env.mongoURI || 'mongodb://localhost:27017';

module.exports = {
    mongoURI: mongoURI,
}