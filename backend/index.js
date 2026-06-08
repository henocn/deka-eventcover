const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const env = require('./src/config/env');
const { sequelize } = require('./src/models');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('event:join', (eventSlug) => {
    if (eventSlug) {
      socket.join(`event:${eventSlug}`);
    }
  });
});

async function bootstrap() {
  try {
    await sequelize.authenticate();
    server.listen(env.port, () => {
      console.log(`API running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Unable to start API:', error);
    process.exit(1);
  }
}

bootstrap();
