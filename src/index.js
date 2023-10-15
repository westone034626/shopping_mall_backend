const express = require('express');
const path = require('path');

const app = express();
const port = 4000;

app.get('/', (req, res) => {
    res.send('안녕하세요.222');
});

app.use(express.static(path.join(__dirname, '../uploads')));

app.listen(port, () => {
    console.log('4000 port');
});