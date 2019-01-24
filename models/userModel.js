const mongoose = require('mongoose');

const schema = mongoose.Schema;

const UserSchema = new schema({
    firstName: {
        type: String,
        trim: true,        
    },
    lastName: {
        type: String,
        trim: true,        
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    }
})
// UserSchema.vi

const User = mongoose.model('user', UserSchema);
module.exports = User;