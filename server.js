const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Endpoint for user registration
app.post('/signup', (req, res) => {
    const { fullname, username, email, password, confirmpassword } = req.body;

    if (password !== confirmpassword) {
        return res.send('Passwords do not match.');
    }

    const userData = `${fullname},${username},${email},${password}\n`;
    fs.appendFile('users.csv', userData, (err) => {
        if (err) throw err;
        res.send('User registered successfully.');
    });
});

// Endpoint for user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    let userFound = false;
    let userFullName = '';

    fs.createReadStream('users.csv')
        .pipe(csv({ headers: ['fullname', 'username', 'email', 'password'] }))
        .on('data', (row) => {
            if (row.username === username && row.password === password) {
                userFound = true;
                userFullName = row.fullname;
            }
        })
        .on('end', () => {
            if (userFound) {
                res.redirect(`/loggedin.html?fullname=${encodeURIComponent(userFullName)}`);
            } else {
                res.send('Invalid username or password.');
            }
        });
});

// Serve the loggedin.html file with dynamic content
app.get('/loggedin.html', (req, res) => {
    const fullname = req.query.fullname;
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome</title>
        </head>
        <body>
            <h1>Welcome, ${fullname}!</h1>
            <!-- Add other functionalities here -->
        </body>
        </html>
    `;
    res.send(htmlContent);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
