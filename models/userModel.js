const mongoose = require('mongoose');

const schema = mongoose.Schema;

const UserSchema = new schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    password: {
        type: String
    }
})

const UsersModel = mongoose.model('user', UserSchema);
module.exports = UsersModel;