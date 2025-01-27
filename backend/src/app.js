const e = require('express');
const express = require('express');

const app = express();

const EXP_PORT = 10042;

app.use(express.static('public'));

app.listen(EXP_PORT, () => {
    // Konsolenausgabe
    console.log("Ich höre auf Port " + EXP_PORT);
    })

    user = ['max', 'nils', 'leonie', 'lisa'];
    passwort = [123, '234', 345, 456];

    

app.get('/', (req, res) => {
    res.send('hello world')
    })

    app.post('/', (req, res) => {
        res.send('POST request to the homepage')
      })

      app.get('/about', (req, res) => {
        res.send ('Hello about')
      })
      
      app.get('/users', (req, res) =>{
        res.send(user)
      })

      app.get('/userPass', (req, res) => {
       res.send(user[1]+ " "+ passwort[1])

      })
      

app.post('/user', async (req, res) => {
    const { name, password } = req.body;
    const result = await createUser(name, password);
    res.send(result);
});
    
app.delete('/user/:name', async (req, res) => {
    const result = await deleteUser(req.params.name);
    res.send(result);
});