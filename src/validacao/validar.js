let { banco } = require('../bancodedados');

const validar = (req, res, next) => {
  const novaConta = req.body;
  const camposObrigatorios = ['nome', 'cpf', 'data_nascimento', 'telefone', 'email', 'senha'];

  if (Object.keys(novaConta).length === 0) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios!' });
  }

  for (let campo of camposObrigatorios) {
    if (!novaConta[campo]) {
      let campoEmCaixaAlta = campo.toUpperCase();
      return res.status(400).json({ mensagem: `O campo (${campoEmCaixaAlta}) é obrigatório!` });
    }
  }

  next();
};

module.exports = validar;