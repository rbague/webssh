import ssh from 'ssh2'

export default function (socket) {
  const connection = new ssh.Client()
  connection.on('banner', message => emitData(message.replace(/(\r?\n)|(\r\n?)/g, '\r\n')))
  connection.on('error', error => {
    console.error('connection error:', error)
  })
  connection.on('ready', () => {
    connection.shell({
      term: 'xterm-color'
    }, (error, stream) => {
      if (error) throw error

      socket.on('data', data => stream.write(data))
      stream.on('data', data => emitData(data))
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
}
