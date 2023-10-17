let { query } = require('express');
let { contas, depositos, transferencias, saques, saldo, banco } = require('../bancodedados');
let { format } = require('date-fns-tz');

const depositar = (req, res) => {
  const { numero_conta, valor } = req.body;

  const conta = contas.find((c) => c.numero === (numero_conta));

  if (!conta) {
    return res.status(404).json({ mensagem: 'Conta não encontrada!' });
  }

  if (valor <= 0 || !valor) {
    return res.status(400).json({ mensagem: 'O valor do depósito deve ser maior que zero!' });
  }

  conta.saldo += valor;

  const dataBrasilia = format(new Date(), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'America/Sao_Paulo' });

  const transacao = {
    data: dataBrasilia,
    numero_conta,
    valor,
  };

  depositos.push(transacao);

  res.status(200).json({ mensagem: 'Depósito realizado com sucesso!' });
}

const sacar = (req, res) => {
  const { numero_conta, valor, senha } = req.body;

  const conta = contas.find((c) => c.numero === numero_conta);

  if (!conta) {
    return res.status(404).json({ mensagem: 'Conta não encontrada!' });
  }

  if (senha !== conta.usuario.senha) {
    return res.status(401).json({ mensagem: 'Senha incorreta!' });
  }

  if (valor <= 0 || !valor) {
    return res.status(400).json({ mensagem: 'O valor de saque deve ser maior que zero!' });
  }

  if (valor > conta.saldo) {
    return res.status(400).json({ mensagem: 'Saldo insuficiente para o saque!' });
  }

  conta.saldo -= valor;

  const transacao = {
    data: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'America/Sao_Paulo' }),
    numero_conta,
    valor: -valor,
  };

  saques.push(transacao);

  const mensagemSucesso = 'Saque realizado com sucesso!';

  res.status(200).json({ mensagem: mensagemSucesso });
}

const transferir = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

  const contaOrigem = contas.find((c) => c.numero === numero_conta_origem);
  const contaDestino = contas.find((c) => c.numero === numero_conta_destino);

  if (!contaOrigem || !contaDestino) {
    return res.status(404).json({ mensagem: 'Conta de origem ou destino não encontrada!' });
  }

  if (senha !== contaOrigem.usuario.senha) {
    return res.status(401).json({ mensagem: 'Senha incorreta!' });
  }

  if (valor <= 0 || valor > contaOrigem.saldo) {
    return res.status(400).json({ mensagem: 'Valor de transferência inválido ou saldo insuficiente!' });
  }

  if (!valor) {
    return res.status(400).json({ mensagem: 'Valor não fornecido!' });
  }

  contaOrigem.saldo -= valor;
  contaDestino.saldo += valor;

  const transacaoOrigem = {
    data: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'America/Sao_Paulo' }),
    numero_conta_origem,
    numero_conta_destino,
    valor: -valor,
  };
  transferencias.push(transacaoOrigem);

  const transacaoDestino = {
    data: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'America/Sao_Paulo' }),
    numero_conta_origem,
    numero_conta_destino,
    valor,
  };
  transferencias.push(transacaoDestino);

  const mensagemSucesso = 'Transferência realizada com sucesso';

  res.status(200).json({ mensagem: mensagemSucesso });
}

const consultarsaldo = (req, res) => {
  const { numero_conta, senha } = req.query;
  const conta = contas.find((c) => c.numero === numero_conta);

  if (!numero_conta) {
    return res.status(404).json({ mensagem: 'Numero da conta não encontrada!' });
  }
  if (!conta){
    return res.status(404).json({ mensagem: 'conta não encontrada!' });
  }

  if (senha !== conta.usuario.senha) {
    return res.status(401).json({ mensagem: 'Senha incorreta!' });
  }
  res.status(200).json({ saldo: conta.saldo });

}

const emitirExtrato = (req, res) => {
  const { numero_conta , senha } = req.query;
  const conta = contas.find((c) => c.numero === numero_conta);

  if (!conta) {
    return res.status(404).json({ mensagem: 'Conta não encontrada!' });
  }

  if (senha !== conta.usuario.senha) {
    return res.status(400).json({ mensagem: 'Senha incorreta!' });
  }

  const depositosConta = depositos.filter((transacao) => transacao.numero_conta === numero_conta);
  const saquesConta = saques.filter((transacao) => transacao.numero_conta === numero_conta);
  const transferenciasEnviadas = transferencias.filter(
    (transacao) => transacao.numero_conta_origem === numero_conta && transacao.valor < 0
  );
  const transferenciasRecebidas = transferencias.filter(
    (transacao) => transacao.numero_conta_destino === numero_conta && transacao.valor > 0
  );


  const extrato = {
    depositos: depositosConta.map((transacao) => ({
      data: transacao.data,
      numero_conta: transacao.numero_conta,
      valor: transacao.valor,
    })),
    saques: saquesConta.map((transacao) => ({
      data: transacao.data,
      numero_conta: transacao.numero_conta,
      valor: transacao.valor,
    })),
    transferenciasEnviadas: transferenciasEnviadas.map((transacao) => ({
      data: transacao.data,
      numero_conta_origem: transacao.numero_conta_origem,
      numero_conta_destino: transacao.numero_conta_destino,
      valor: +transacao.valor,
    })),
    transferenciasRecebidas: transferenciasRecebidas.map((transacao) => ({
      data: transacao.data,
      numero_conta_origem: transacao.numero_conta_origem,
      numero_conta_destino: transacao.numero_conta_destino,
      valor: transacao.valor,
    })),
  };

  res.status(200).json(extrato);
};





module.exports = {
  depositar,
  sacar,
  transferir,
  emitirExtrato,
  consultarsaldo
};






