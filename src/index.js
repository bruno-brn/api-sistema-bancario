const express = require('express');
let rotas = require('./rotas');


const app = express();

app.use(express.json());
app.use(rotas);
app.listen(3000);