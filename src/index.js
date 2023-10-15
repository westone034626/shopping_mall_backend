const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = 4000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('connected with mongo db'))
    .catch(console.log);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    // res.send('안녕하세요.222');
    throw new Error('It is an error.');
});

app.post('/', (req, res) => {
    console.log(req.body);
    res.json(req.body);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.send(error.message || '서버 에러 발생');
});

app.use(express.static(path.join(__dirname, '../uploads')));

app.listen(port, () => {
    console.log('4000 port');
});