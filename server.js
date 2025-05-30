import express from 'express';
import cors from 'cors';
import jsonServer from 'json-server'; // Mantém apenas a importação com 'import'
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

// Configurações do Google OAuth
const client = new OAuth2Client('1034318345825-lldn929hoddci5v10u3fof6o89mlul4f.apps.googleusercontent.com'); // Substitua com o seu client ID do Google

// Criação do servidor express
const app = express();

// Habilitar CORS para aceitar requisições do frontend (localhost:5173)
app.use(cors({
  origin: '*',  // Permite todas as origens (só para desenvolvimento)
}));


// Middleware para ler o corpo das requisições como JSON
app.use(express.json());

// Configuração do JSON server
const router = jsonServer.router('src/db.json'); // Verifique o caminho para o db.json
const middlewares = jsonServer.defaults();
app.use(middlewares);
app.use('/api', router); // Prefixo para as rotas da API

// Rota para validar o token do Google
app.post('/auth/google/callback', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1]; // O token do Google é enviado no cabeçalho Authorization

  try {
    // Verifica o token com o Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '1034318345825-lldn929hoddci5v10u3fof6o89mlul4f.apps.googleusercontent.com', // Verifique se o client ID corresponde
    });

    // Extrai as informações do usuário
    const payload = ticket.getPayload();
    console.log('User info from Google:', payload);

    // Você pode criar um JWT para o frontend, que será usado para autenticação subsequente
    const jwtToken = jwt.sign(payload, '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', { expiresIn: '1h' });

    // Responde com o JWT e as informações do usuário
    res.json({
      token: jwtToken,
      user: payload,
    });
  } catch (error) {
    console.error('Erro ao verificar token do Google:', error);
    res.status(401).send('Token inválido');
  }
});

// Iniciar o servidor na porta 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
