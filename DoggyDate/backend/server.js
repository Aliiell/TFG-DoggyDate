const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const http = require('http');
const { Server } = require('socket.io');
const usuarioRoutes = require('./routes/usuarioRoute');
const mascotaRoutes = require('./routes/mascotaRoute');
const interaccionRoutes = require('./routes/interaccionesRoute');
const groupRoutes = require('./routes/groupRoute');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoute');
const vacunaRoutes = require('./routes/vacunaRoute');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = ['http://localhost', 'http://localhost:5173', 'http://localhost:5173'];

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Servir imágenes

// Configuración de la conexión a la base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session' // Nombre de la tabla en la base de datos
    }),
    secret: process.env.SESSION_SECRET, // Clave secreta para cifrar la sesión
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true, 
        maxAge: 1000 * 60 * 60 * 24, // 1 día de duración
        sameSite: 'lax',
    }
}));

app.use('/usuarios', usuarioRoutes);

app.use('/mascotas', mascotaRoutes);

app.use('/', interaccionRoutes);

app.use('/grupos', groupRoutes);

app.use('/posts', postRoutes);

app.use('/chats', chatRoutes);

app.use('/vacunas', vacunaRoutes);

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);
  
  // Unir al usuario a una sala específica para su chat
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`Usuario ${socket.id} se unió al chat ${chatId}`);
  });
  
  // Manejar nuevo mensaje
  socket.on('send_message', async (messageData) => {
    try {
      const { chat_id, usuario_id, texto } = messageData;
      
      // Guardar mensaje en la base de datos
      const newMessage = await pool.query(
        `INSERT INTO mensajes (chat_id, usuario_id, texto, fecha_envio, leido)
         VALUES ($1, $2, $3, NOW(), false)
         RETURNING *, (SELECT nombre FROM usuarios WHERE id = $2) as usuario_nombre`,
        [chat_id, usuario_id, texto]
      );
      
      // Actualizar fecha del último mensaje
      await pool.query(
        'UPDATE chats SET ultimo_mensaje = NOW() WHERE id = $1',
        [chat_id]
      );
      
      // Emitir el mensaje a todos en el chat
      io.to(chat_id).emit('receive_message', newMessage.rows[0]);
    } catch (err) {
      console.error('Error al enviar mensaje por socket:', err);
    }
  });
  
  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

module.exports = { app, server };