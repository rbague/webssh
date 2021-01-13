import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { io } from 'socket.io-client'

import 'xterm/css/xterm.css'

export default class WebSSH {
  constructor (element, options) {
    this.prepareTerminal(element)
    this.connectSocket(options)
    this.addListeners()
  }

  prepareTerminal (element) {
    this.terminal = new Terminal({
      cursorBlink: true,
      bellStyle: 'sound',
      convertEol: true,
      screenReaderMode: false,
      tabStopWidth: 2
    })
    this.terminal.loadAddon(new WebLinksAddon())
    this.terminal.loadAddon(this.fitAddon = new FitAddon())
    this.terminal.open(element)
    this.terminal.focus()
    this.fitAddon.fit()
  }

  connectSocket ({ url, ...config }) {
    const auth = { username: config.username, password: config.password }
    const query = { host: config.host }
    if (config.port) query.port = config.port // optional parameter

    const options = { path: '/socket', auth, query }
    this.socket = url ? io(url, options) : io.connect(options)
  }

  addListeners () {
    if (!this.terminal || !this.socket) return

    this.terminal.onData(data => this.socket.emit('data', data))
    this.socket.on('data', data => this.terminal.write(data))

    this.socket.on('connect', this.resize)
    this.socket.on('connect_error', () => console.error('could not connect with the ssh server'))
    this.socket.on('error', message => {
      this.terminal.reset()
      this.terminal.writeln(`\u001b[31m${message}\u001b[0m`)
    })
    this.socket.on('disconnect', reason => {
      this.dispose()

      if (/server/i.test(reason)) {
        console.error('connection closed by ssh server')
      }
    })
  }

  resize () {
    if (this.terminal) {
      if (this.fitAddon) {
        this.fitAddon.fit()
      }

      if (this.socket) {
        this.socket.emit('resize', {
          rows: this.terminal.rows,
          cols: this.terminal.cols
        })
      }
    }
  }

  dispose () {
    if (this.terminal) {
      this.terminal.dispose()
      this.terminal = null
      this.fitAddon = null
    }

    if (this.socket) {
      this.socket.io.reconnection(false)
      this.socket.disconnect()
      this.socket = null
    }
  }
}
