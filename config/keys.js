const mongoURI = process.env.mongoURI || 'mongodb://localhost:27017/auth';

module.exports = {
    mongoURI: mongoURI,
}