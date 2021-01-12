import ssh from 'ssh2'

export default function (socket) {
  const { auth, query } = socket.handshake
  if (!query.host || !auth.username || !auth.password) {
    socket.emit('error', 'missing required credentials')
    socket.disconnect()
    return
  }

  const connection = new ssh.Client()
  connection.on('banner', message => emitData(message.replace(/(\r?\n)|(\r\n?)/g, '\r\n')))
  connection.on('error', error => connectionError(error))
  connection.on('end', () => connectionError('ended'))
  connection.on('close', () => connectionError('closed'))
  connection.on('ready', () => {
    connection.shell({
      term: 'xterm-color'
    }, (error, stream) => {
      if (error) throw error

      socket.on('data', data => stream.write(data))
      socket.on('disconnect', () => connection.end())
      socket.on('resize', ({ rows, cols }) => stream.setWindow(rows, cols))

      stream.on('data', data => emitData(data))
      stream.on('close', () => {
        console.info('ssh session finished')
        connection.end()
      })
    })
  })

  connection.connect({
    host: query.host,
    port: query.port,
    username: auth.username,
    password: auth.password,
    keepaliveInterval: 60000
  })

  function emitData (data) {
    socket.emit('data', data.toString('utf-8'))
  }

  function connectionError (error) {
    console.error('connection error:', error)

    if (error instanceof Error) socket.emit('error', error.message)
    socket.disconnect()
  }
}
