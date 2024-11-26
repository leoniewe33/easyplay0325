const express = require('express');

const app = express();

const EXP_PORT = 8080;

app.use(express.static('public'));

app.listen(EXP_PORT, () => {
    // Konsolenausgabe
    console.log("Ich höre auf Port " + EXP_PORT);
    })

app.get('/', (req, res) => {
    res.send('hello world')
    })

    app.post('/', (req, res) => {
        res.send('POST request to the homepage')
      })

      app.get('/about', (req, res) => {
        res.send ('Hello about')
      })
      