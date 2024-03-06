const connect_to_mongodb = require('./db');
const express = require('express')
const cors = require('cors');

connect_to_mongodb();

const app = express()
const port = 7400

app.use(cors());
app.use(express.json());

// Enable CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});


app.use(cors({
  allowedHeaders: ['Content-Type', 'auth-token'], // Add 'auth-token' to the allowed headers
}));

// routes:
app.use('/api/auth', require('./routes/auth'))
app.use('/api', require('./routes/vms'))


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})