import express from 'express'
import http from 'http'
import { Server as SocketServer } from 'socket.io'
import path from 'path'

const app = express()
const server = http.createServer(app)

const publicPath = path.resolve(path.dirname(''), '..', 'client', 'dist')
app.use('/', express.static(publicPath, { index: false }))
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'))
})

const io = new SocketServer(server, { serveClient: false, path: '/socket' })
io.on('connection', socket => {
  socket.on('data', data => {
    socket.emit('data', data)
  })
})

server.listen(2222, () => {
  console.log('Server listening on 0.0.0.0:2222 ...')
})
