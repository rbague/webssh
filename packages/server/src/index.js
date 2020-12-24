import express from 'express'
import http from 'http'
import { Server as SocketServer } from 'socket.io'
import path from 'path'
import socketShell from './socket-shell.js'
import expressSession from 'express-session'
import socketSession from 'express-socket.io-session'

const app = express()
const server = http.createServer(app)

const session = expressSession({
  secret: process.env.SESSION_SECRET_KEY,
  name: '_webssh_session',
  resave: true,
  saveUninitialized: true
})
app.use(session)

const publicPath = path.resolve(path.dirname(''), '..', 'client', 'dist')
app.use('/', (req, res, next) => {
  const indexRequest = req.url.match(/^\/(index\.html)?$/)
  indexRequest ? res.sendStatus(404) : next()
})
app.use('/', express.static(publicPath, { index: false }))
app.get('/:hostport/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'))

  const [host, port] = decodeURIComponent(req.params.hostport).split(':', 2)
  req.session.ssh = { host, port }
})

const io = new SocketServer(server, { serveClient: false, path: '/socket' })
io.use(socketSession(session, { autoSave: true }))
io.on('connection', socketShell)

server.listen(2222, () => {
  console.log('Server listening on 0.0.0.0:2222 ...')
})
