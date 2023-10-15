const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('안녕하세요.222');
});

app.post('/', (req, res) => {
    console.log(req.body);
    res.json(req.body);
});

app.use(express.static(path.join(__dirname, '../uploads')));

app.listen(port, () => {
    console.log('4000 port');
});