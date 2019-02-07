const express = require('express');
const path = require('path');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mandrill = require('mandrill-api/mandrill')
const mandrillClient = new mandrill.Mandrill(process.env.MANDRILL_KEY)
const User = require('../models/userModel');
const saltRound = 10;
const clientSecret = process.env.CLIENT_SECRET;

//hash a password
function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRound)
            .then(salt => {
                bcrypt.hash(password, salt)
                    .then(hash => resolve(hash))
                    .catch(err => { reject(err) })
            })
            .catch(err => { reject(err) })
    })
}

//POST request to /users
router.post('/register', function (req, res, next) {
    const { userName, email, password, avatar } = req.body;
    User.findOne({ email })
        .then(user => {
            if (user) return res.status(409).json({ error: 'Email is already registered !' })
            const newUser = new User({
                userName,
                email,
                password,
                avatar
            })
            hashPassword(password)
                .then(hash => {
                    newUser.password = hash
                    newUser.save()
                        .then(user => {
                            return res.status(200).json({ data: 'you have successfully registered' })
                        })
                        .catch(err => { throw err })
                })
                .catch(err => console.log(err))
        })
        .catch(err => { throw err })
});

//login request
router.post('/login', function (req, res, next) {
    const { email, password } = req.body;
    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'Invalid user' })
            }
            bcrypt.compare(password, user.password)
                .then(match => {
                    if (!match) {
                        return res.status(400).json({ error: 'Icorrect password' })
                    }
                    const { _id, userName, email, avatar } = user
                    const token = jwt.sign({ email }, clientSecret)
                    return res.status(200).json({ user: { _id, userName, email, avatar }, token })
                })
                .catch(err => { throw err })
        })
        .catch(err => { throw err })
});

//login through google
router.post('/googleLogin', function (req, res, next) {
    const { email, userName, avatar } = req.body;
    //check if user already register
    User.findOne({ email })
        .then(user => {
            //if registered login to the app
            console.log('google', user)
            if (user) {
                const token = jwt.sign({ email }, clientSecret)
                return res.status(200).json({ user, token })
            } else {
                //else create a new user and insert to the db and login to the app
                const newUser = new User({
                    userName,
                    email,
                    avatar
                })
                newUser.save()
                    .then(user => {
                        const token = jwt.sign({ email }, clientSecret)
                        return res.status(200).json({ user, token })
                    })
                    .catch(err => { throw err })
            }
        })
        .catch(err => { throw err })
})

//change password
router.put('/changePassword', function (req, res, next) {
    const { _id, currentPassword, newPassword } = req.body;
    console.log(_id)
    //find the user with given id
    User.findOne({ _id })
        .then(user => {
            console.log(user)
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            //compare old password with password from db
            bcrypt.compare(currentPassword, user.password)
                .then(match => {
                    //if password doesn't match  return message "your current password doesn't match"
                    if (!match) {
                        return res.status(400).json({ error: 'your current password doesn\'t match' })
                    } else {

                        //if password match update db password with new hashed password
                        hashPassword(newPassword)
                            .then(newHash => {
                                console.log('newHash' + newHash)
                                User.findOneAndUpdate({ _id }, { password: newHash })
                                    .then(response => res.status(200).json({ success: 'Password changed successfully' }))
                                    .catch(err => res.status(400).json({ error: 'error changing password' }))
                            })
                            .catch(err => console.log(err))
                    }
                })
                .catch(err => { throw err })
        })
        .catch(err => console.log(err))
});

//change password
router.post('/forgotPassword', function (req, res, next) {
    const { email } = req.body;
    console.log('forgot password' + email)
    const token = jwt.sign({ email }, clientSecret)
    const template = `
    <p>Click on the link below to reset your password</p>
    <a target='_blank' href='http://localhost:3000/resetPassword/${token}'>
    http://localhost:3000/resetPassword/${token}</a>
    `
    const message = {
        "html": template,
        "text": "Authenticate email",
        "subject": "Email authentication",
        "from_email": "connections@hyphenmail.com",
        "from_name": "Hyphenapp",
        "to": [{
            "email": email,
            "name": "Recipient Name",
            "type": "to"
        }],
        "headers": {
            "Reply-To": "connections@hyphenmail.com"
        }
    };
    var async = false;
    var ip_pool = "Main Pool";
    var send_at = new Date();
    mandrillClient.messages.send({ "message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at }, function (result) {
        console.log('mail sent');
        console.log(result)
        return res.status(200).json({ data: 'mail sent' })
    }, function (e) {
        return res.status(404).json({ error: 'error sending mail' })
    });
});

//send mail to the email address
router.post('/sendMail', function async(req, res, next) {
    console.log('req.body')
    console.log(req.body)
    const { _id, email } = req.body;
    const token = jwt.sign({ _id, email }, clientSecret)
    const template = `
    <p>Click on the link below to authenticate your email</p>
    <a target='_blank' href='http://localhost:3000/emailValidation/${token}'>
    http://localhost:3000/emailValidation/${token}</a>
    `
    const message = {
        "html": template,
        "text": "Authenticate email",
        "subject": "Email authentication",
        "from_email": "connections@hyphenmail.com",
        "from_name": "Hyphenapp",
        "to": [{
            "email": email,
            "name": "Recipient Name",
            "type": "to"
        }],
        "headers": {
            "Reply-To": "connections@hyphenmail.com"
        }
    };
    var async = false;
    var ip_pool = "Main Pool";
    var send_at = new Date();
    mandrillClient.messages.send({ "message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at }, function (result) {
        console.log('mail sent');
        console.log(result)
        return res.status(200).json({ data: 'mail sent' })
    }, function (e) {
        return res.status(404).json({ error: 'error sending mail' })
    });
});
//send mail to the email address
router.post('/resetPassword', function async(req, res, next) {
    const { token } = req.body;
    //get email from token
    jwt.verify(token, clientSecret, (err, { email }) => {
        if (err) return res.status(400).json({ error: 'Invalid link' })
        User.findOne({ email })
            .then(user => {
                //check if user exist with the given email
                console.log(user)
                if (user) {
                    return res.status(200).json({ status: true, id: user._id })
                } else {
                    return res.status(200).json({ status: false })
                }
            })
            .catch(err => console.log(err))
    })
});

//change email address after clicking on the changeEmail link sent to the mail
router.post('/changeEmail', function (req, res, next) {
    const { token } = req.body;
    jwt.verify(token, clientSecret, (err, { _id, email }) => {
        console.clear()
        console.log('changeEmail')
        console.log(err)
        console.log(email)
        const newEmail = email;
        if (err) return res.status(400).json({ error: 'Invalid activation link' })
        User.findOne({ email })
            .then(user => {
                console.log(user)
                if (user && user.email === email) {
                    return res.status(409).json({ error: 'Email is already registered !' })
                } else {
                    User.findOneAndUpdate({ _id }, { email: newEmail })
                        .then(user => {
                            console.log('after update')
                            console.log(user)
                            const { _id, userName, email, avatar } = user
                            return res.status(200).json({ user: { _id, userName, email: newEmail, avatar } })
                        })
                        .catch(err => console.log('after updated', err))
                }
            })
            .catch(err => console.log(err))
    })
})

module.exports = router;