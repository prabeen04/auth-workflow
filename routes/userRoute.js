const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mandrill = require('mandrill-api/mandrill')
const mandrillClient = new mandrill.Mandrill('fD-HfoAUJEab-XxZb12Q6A')
const User = require('../models/userModel');
const saltRound = 10;
const clientSecret = '!@#$%^&*()_+';

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
    const { firstName, lastName, email, password } = req.body;
    User.findOne({ email })
        .then(user => {
            if (user) return res.status(409).json({ error: 'Email is already registered !' })
            const newUser = new User({
                firstName,
                lastName,
                email,
                password,
            })
            hashPassword(password)
                .then(hash => {
                    newUser.password = hash
                    newUser.save()
                        .then(user => {
                            delete user.password
                            return res.status(200).json({ user })
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
    console.log(email)
    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            bcrypt.compare(password, user.password)
                .then(match => {
                    if (!match) {
                        return res.status(400).json({ error: 'Icorrect password' })
                    }
                    const token = jwt.sign({ email }, clientSecret)
                    return res.status(200).json({ user, token })
                })
                .catch(err => { throw err })
        })
        .catch(err => { throw err })
});

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
                    }
                    //if password match update db password with new hashed password
                    hashPassword(newPassword)
                        .then(newHash => {
                            console.log('newHash' + newHash)
                            User.findOneAndUpdate({ _id }, { password: newHash })
                                // .then(response => res.status(200).json({ success: 'Password changed successfully' }))
                                .then(response => console.log('response '+response))
                                .catch(err => console.log(err))
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => { throw err })
        })
        .catch(err => console.log(err))



    // UserModel.findByIdAndUpdate({ "_id": _id }, { password })
    //     .then(() => {
    //         UserModel.findOne({ "_id": req.params.id })
    //             .then(user => {
    //                 res.status(200).send(user);
    //             })
    //             .catch(next)
    //     })
    //     .catch(next)
});
//send mail to the email address
router.get('/sendMail', function async(req, res, next) {
    var message = {
        "html": "<p>Example HTML content</p>",
        "text": "Example text content",
        "subject": "example subject",
        "from_email": "message.from_email@example.com",
        "from_name": "Example Name",
        "to": [{
            "email": "prabeen.strange@gmail.com",
            "name": "Recipient Name",
            "type": "to"
        }],
        "headers": {
            "Reply-To": "message.reply@example.com"
        },
        "important": false,
        "track_opens": null,
        "track_clicks": null,
        "auto_text": null,
        "auto_html": null,
        "inline_css": null,
        "url_strip_qs": null,
        "preserve_recipients": null,
        "view_content_link": null,
        "bcc_address": "message.bcc_address@example.com",
        "tracking_domain": null,
        "signing_domain": null,
        "return_path_domain": null,
        "merge": true,
        "merge_language": "mailchimp",
        "global_merge_vars": [{
            "name": "merge1",
            "content": "merge1 content"
        }],
        "merge_vars": [{
            "rcpt": "recipient.email@example.com",
            "vars": [{
                "name": "merge2",
                "content": "merge2 content"
            }]
        }],
        "tags": [
            "password-resets"
        ],
        "subaccount": "customer-123",
        "google_analytics_domains": [
            "example.com"
        ],
        "google_analytics_campaign": "message.from_email@example.com",
        "metadata": {
            "website": "www.example.com"
        },
        "recipient_metadata": [{
            "rcpt": "recipient.email@example.com",
            "values": {
                "user_id": 123456
            }
        }],
        "attachments": [{
            "type": "text/plain",
            "name": "myfile.txt",
            "content": "ZXhhbXBsZSBmaWxl"
        }],
        "images": [{
            "type": "image/png",
            "name": "IMAGECID",
            "content": "ZXhhbXBsZSBmaWxl"
        }]
    };
    var async = false;
    var ip_pool = "Main Pool";
    var send_at = new Date();
    mandrillClient.messages.send({ "message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at }, function (result) {
        console.log(result);
        /*
        [{
                "email": "recipient.email@example.com",
                "status": "sent",
                "reject_reason": "hard-bounce",
                "_id": "abc123abc123abc123abc123abc123"
            }]
        */
    }, function (e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
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