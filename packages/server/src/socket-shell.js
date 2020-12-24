import ssh from 'ssh2'

export default function (socket) {
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

      stream.on('data', data => emitData(data))
      stream.on('close', () => {
        console.info('ssh session finished')
        connection.end()
      })
    })
  })

  connection.connect({
    host: '',
    username: '',
    password: '',
    keepaliveInterval: 60000
  })

  function emitData (data) {
    socket.emit('data', data.toString('utf-8'))
  }

  function connectionError (error) {
    console.error('connection error:', error)
    socket.disconnect()
  }
}
