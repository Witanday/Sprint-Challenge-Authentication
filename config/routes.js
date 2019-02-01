const axios = require('axios');
require('dotenv').config();
const { authenticate } = require('../auth/authenticate');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../database/dbConfig');


module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function initiateToken(username){
const payload = {
  username,
}

const secret = process.env.JWT_SECRET;

const options = {
  expiresIn : '20m'
}

return jwt.sign(payload, secret, options);
}

function hashPassword(cred){
  const hash = bcrypt.hashSync(cred.password, 14);
  return cred.password = hash;
}



function register(req, res) {
  // implement user registration
  const cred = req.body;
  
  hashPassword(cred);
db('users').insert(cred)
.then(id =>{
  const token = initiateToken(cred.username)
  res.status(201).json({id,token })
})
.catch(err =>{
  res.status(500).json(err)
})


}

function login(req, res) {
  // implement user login
  const cred = req.body;

db('users').where({username : cred.username }).first()
.then(user =>{
  if( user && bcrypt.compareSync(cred.password, user.password)){
    const token = initiateToken(cred.username)
    res.status(201).json({Message :`Welcome ${cred.username}`, token })
  }
  else  {
    return res.status(401).json({ error: 'Incorrect credentials' });
  }
  
})
.catch(err =>{
  res.status(500).json(err)
})
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
