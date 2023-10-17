const { banco } = require('../bancodedados');

const autenticacao = (req, res, next) => {
  const senha = req.query.senha_banco;

  if (senha !== banco.senha) {
    return res.status(401).json({ mensagem: 'A senha do banco informada é inválida!' });
  }

  next();
};

module.exports = {
  autenticacao
};
