import validator from "validator";
import { getDBConnection } from "../db/db.js";
import bcrypt from "bcrypt";

export async function registerUser(req, res) {
  let { name, email, username, password } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  name = name.trim();
  email = email.trim();
  username = username.trim();

  if (!/^[a-zA-Z0-9_-]{1,20}$/.test(username)) {
    return res.status(400).json({
      error:
        "Username must be 1–20 characters, using letters, numbers, _ or -.",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    /*
    Challenge:
      1. Import the bcryptjs package.
      2. Use it to hash the incoming password just before it's stored in the database.
        - Use a cost-factor of 10

    To test, sign up a new user and run logTable.js.

    hint.md for help!
    */

    const hashed = await bcrypt.hash(password, 10);

    const db = await getDBConnection();

    const existing = await db.get(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username],
    );

    if (existing) {
      return res
        .status(400)
        .json({ error: "Email or username already in use." });
    }

    const result = await db.run(
      "INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)",
      [name, email, username, hashed],
    );

    /*
    Challenge:
      1. Store the 'lastID' from the database insertion above to the 'userId' property on the 'session' object on the request. This will bind our logged in user to the session.
    */

    req.session.userId = result.lastID;

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
}

export async function loginUser(req, res) {
  /*
Challenge:

 1. If the user's login details are incomplete, end the response with this JSON and a suitable code:
    { error: 'All fields are required' }

 2. If the user's login details are invalid, end the response with this JSON and a suitable code:
    { error: 'Invalid credentials'}. This could be because the user does not exist OR because the password does not match the username.

 3. If the user’s login details are valid, create a session for the user and end the response with this JSON:
    { message: 'Logged in' }

Look at .registerUser() above. Is there anything else you need to do?

Important: lastID is not available to us here, so how can we get the user’s ID to attach it to the session?

You can test it by signing in with the following:
username: test
password: test

hint.md for help.
*/

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const db = await getDBConnection();

    const validUserQuery = `SELECT * FROM users WHERE username = ?`;
    const validUserParams = [username];
    const validUser = await db.get(validUserQuery, validUserParams);

    if (!validUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPassword = await bcrypt.compare(password, validUser.password);

    if (!isPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = validUser.id;
    return res.status(200).json({ message: "Logged in" });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
}

/*
Challenge:
1. Create a function which logs out the user.
- You can use the .destroy() method directly on the session.
- .destroy() takes a callback function which you can use to send a confirmation response with this JSON:
  { message: 'Logged out' }

You will need to write code here and in one other place!

Test with:
username: test
password: test
*/

export async function logoutUser(req, res) {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
}
