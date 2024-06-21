const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middileware/fetchuser');
const JWT_STOKEN = 'SecretCode';
// ROUTE:1 create user using: Post "/api/auth".Doesn't require auth

router.post('/', [
  body('name').isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 5 })

], async (req, res) => {
  // if there are errors ,return bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let user = await User.findOne({ email: req.body.email })
    if (user) {
      return res.status(400).json({ error: "email already exsists" })
    }
    const salt = await bcrypt.genSalt(10);
    const Secpass = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: Secpass,
    })

    const data = {
      user: {
        id: user.id
      }
    }
    const token = jwt.sign(data, JWT_STOKEN);
    console.log(token);
    res.json({ AuthToken: token });



  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occured");
  }

})

// ROUTE:2 authenticate user using: POST "/api/auth/login".No login required
router.post('/login', [
  body('email', 'enter a valid email').isEmail(),
  body('password', 'password cannot be blank').exists(),

], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "please login with correct credentials" });

    }
    const passwordcompare = await bcrypt.compare(password, user.password);
    if (!passwordcompare) {
      return res.status(400).json({ error: "please login with correct credentials" });
    }
    const data = {
      user: {
        id: user.id
      }
    }
    const token = jwt.sign(data, JWT_STOKEN);
    res.send({ AuthToken: token })

  } catch (error) {
    console.error(error.message);
    res.status(500).send(" internal server  error occured");
  }
})
// ROUTE:3 get loggedin user details using: POST "/api/auth/getuser".Login required
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);

  } catch (error) {
    console.error(error.message);
    res.status(500).send(" internal server  error occured");
  }
})
module.exports = router