const express = require('express');
const bodyParser = require('body-parser');
const intemediarios = require('./intermediarios/auteicacao')
const contas = require('./controladores/contas');
const transacoes = require('./controladores/transacoes')
const validar = require('./validacao/validar');


const rotas = express();

rotas.use(bodyParser.json());

// Rotas relacionadas a contas
rotas.get('/contas', intemediarios.autenticacao, contas.listarContas)
rotas.post('/contas', validar, contas.criarConta);
rotas.get('/contas/:numeroConta/usuario', intemediarios.autenticacao, contas.buscarConta);
rotas.put('/contas/:numeroConta/usuario', validar, contas.atualizaConta);
rotas.delete('/contas/:numeroConta', contas.excluirConta);

// Rotas relacionadas a transações
rotas.post('/transacoes/depositar', transacoes.depositar);
rotas.post('/transacoes/sacar', transacoes.sacar);
rotas.post('/transacoes/transferir', transacoes.transferir);
rotas.get('/contas/saldo', transacoes.consultarsaldo);
rotas.get('/contas/extrato', transacoes.emitirExtrato);

module.exports = rotas;