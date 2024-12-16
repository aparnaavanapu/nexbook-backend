// Import required modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // For hashing passwords
const { Client } = require('pg');

const NexBook = new Client({
    user: "postgres",
    host: "localhost",
    database: "NexBook",
    password: "aparna2306",
    port: 5432,
});

// Initialize the app and database
const app = express();
const db = new sqlite3.Database('./NexBook.db');

// Middleware to parse JSON requests
app.use(bodyParser.json());

// API route for signup
app.post('/signup', async (req, res) => {
    const { name, email, number, password } = req.body;

    // Validate input fields
    if (!name || !email || !number || !password) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    try {
        // Check if the email already exists in the database
        db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error!' });
            }

            if (row) {
                return res.status(409).json({ error: 'Email already exists!' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert the new user into the database
            db.run(
                'INSERT INTO Users (name, email, number, password) VALUES (?, ?, ?, ?)',
                [name, email, number, hashedPassword],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to create user!' });
                    }

                    res.status(201).json({ message: 'User signed up successfully!' });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error!' });
    }
});

// Start the server
const port = process.env.PORT || 5001; // Use environment variable or fallback to 5000
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

