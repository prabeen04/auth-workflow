const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const saltRound = 10;
//POST request to /users
router.post('/register', function (req, res, next) {
    const { firstName, lastName, email, password } = req.body;
    User.findOne({ email })
        .then(user => {
            if (user) {
                return res.status(409).json({ error: 'Email is already registered !' })
            }
            const newUser = new User({
                firstName,
                lastName,
                email,
                password,
            })
            bcrypt.genSalt(saltRound)
                .then(salt => {
                    bcrypt.hash(password, salt)
                        .then(hash => {
                            newUser.password = hash
                            newUser.save()
                                .then(user => {
                                    delete user.password
                                    return res.status(200).json({ user })
                                })
                                .catch(err => { throw err })
                        })
                        .catch(err => { throw err })
                })
                .catch(err => { throw err })
        })
        .catch(err => { throw err })
});
//login request
router.post('/login', function (req, res, next) {
    const { email, password } = req.body;
    console.log(email)
    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            bcrypt.compare(password, user.password)
                .then(isSame => {
                    if (!isSame) {
                        return res.status(400).json({ error: 'Icorrect password' })
                    }
                    return res.status(200).json({user})
                })
                .catch(err => { throw err })
        })
        .catch(err => { throw err })
});

//PUT request to /users/:id
// router.put('/users/:id', function (req, res, next) {
//     UserModel.findByIdAndUpdate({ "_id": req.params.id }, req.body)
//         .then(() => {
//             UserModel.findOne({ "_id": req.params.id })
//                 .then(user => {
//                     res.status(200).send(user);
//                 })
//                 .catch(next)
//         })
//         .catch(next)
// });



module.exports = router;