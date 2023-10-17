let { contas, banco, id } = require('../bancodedados');

const listarContas = (req, res) => {
  const { senha_banco } = req.query

  if (!senha_banco) {
    return res.status(400).json({ mensagem: 'Senha obrigatoria' })
  }
  if (senha_banco !== banco.senha) {
    return res.status(400).json({ mensagem: 'Senha inválida' })
  }
  return res.status(200).json(contas);
}

const criarConta = (req, res) => {
  const novaConta = req.body;
  const camposObrigatorios = ['nome', 'cpf', 'data_nascimento', 'telefone', 'email', 'senha'];

  for (let campo of camposObrigatorios) {
    if (!novaConta[campo]) {
      return res.status(400).json({ mensagem: `O campo ${campo} é obrigatório!` });
    }
  }

  const cpfExistente = contas.some((conta) => conta.usuario.cpf === novaConta.cpf);
  const emailExistente = contas.some((conta) => conta.usuario.email === novaConta.email);

  if (cpfExistente || emailExistente) {
    return res.status(400).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" });
  }

  const numeroConta = (contas.length + 1).toString();

  const novaContaBancaria = {
    numero: numeroConta,
    saldo: 0,
    usuario: novaConta,
  };

  contas.push(novaContaBancaria);

  res.status(201).json({ mensagem: 'Conta criada com sucesso!' });
}

const atualizaConta = (req, res) => {
  const numeroConta = req.params.numeroConta;
  const dadosAtualizados = req.body;

  const conta = contas.find((c) => c.numero === numeroConta);
  if (!conta) {
    return res.status(404).json({ mensagem: 'Conta não encontrada!' });
  }

  if (dadosAtualizados.cpf !== conta.usuario.cpf) {
    const existeCpf = contas.find(conta => conta.usuario.cpf === dadosAtualizados.cpf);
    if (existeCpf) {
      return res.status(400).json({ mensagem: 'CPF ou e-mail já cadastrados em outra conta!' });
    }
  }
  if (dadosAtualizados.email !== conta.usuario.email) {
    const existeEmail = contas.find(conta => conta.usuario.email === dadosAtualizados.email);
    if (existeEmail) {
      return res.status(400).json({ mensagem: 'CPF ou e-mail já cadastrados em outra conta!' });
    }
  }
  conta.usuario = dadosAtualizados

  res.status(200).json({ mensagem: 'Conta atualizada com sucesso' })
}

const encontrarContaPorNumero = (numeroConta) => {
  const conta = contas.find((c) => c.numero === numeroConta);
  return conta;
}

const buscarConta = (req, res) => {
  const numeroConta = req.params.numeroConta;
  const conta = encontrarContaPorNumero(numeroConta);

  if (!conta) {
    return res.status(404).json({ mensagem: 'Conta não encontrada!' });
  }

  res.json(conta);
}

const excluirConta = (req, res) => {
  const numeroConta = req.params.numeroConta;

  const contaIndex = contas.findIndex((c) => c.numero === numeroConta);

  if (contaIndex === -1) {
    return res.status(404).json({ mensagem: 'Conta não encontrada!' });
  }

  if (contas[contaIndex].saldo !== 0) {
    return res.status(400).json({ mensagem: 'A conta só pode ser removida se o saldo for zero!' });
  }

  contas.splice(contaIndex, 1);

  res.status(200).json({ mensagem: 'Conta excluída com sucesso!' });
}

module.exports = {
  listarContas,
  criarConta,
  atualizaConta,
  buscarConta,
  excluirConta,
};
