const express = require('express');

const app = express();
const port = 4000;

app.get('/', (req, res) => {
    res.send('안녕하세요.222');
});

app.listen(port, () => {
    console.log('4000 port');
});