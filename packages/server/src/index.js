import http from 'http'
import { Server as SocketServer } from 'socket.io'
import socketShell from './socket-shell.js'

const server = http.createServer((req, res) => {
  res.writeHead(404)
  res.end()
})

const io = new SocketServer(server, {
  serveClient: false,
  path: '/socket',
  cors: {
    origin: '*',
    methods: ['GET'],
    credentials: true,
    preflightcontinue: false,
    optionsSuccessStatus: 204
  }
})
io.on('connection', socketShell)

server.listen(2222, () => {
  console.log('Server listening on 0.0.0.0:2222 ...')
})
