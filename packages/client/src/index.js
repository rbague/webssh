import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { io } from 'socket.io-client'

import './style.css'
import 'xterm/css/xterm.css'

const fitAddon = new FitAddon()
const socket = io.connect({ path: '/socket' })

const terminal = new Terminal({
  cursorBlink: true,
  bellStyle: 'sound',
  convertEol: true,
  screenReaderMode: false,
  tabStopWidth: 2
})
terminal.loadAddon(new WebLinksAddon())
terminal.loadAddon(fitAddon)
terminal.open(document.getElementById('terminal'))
terminal.focus()
fitAddon.fit()

terminal.onData(data => socket.emit('data', data))
socket.on('data', data => terminal.write(data))

socket.on('connect', resize)
socket.on('connect_error', () => console.error('could not connect with the ssh server'))
socket.on('disconnect', reason => {
  if (/server/i.test(reason)) {
    console.error('connection closed by ssh server')
  }
  socket.io.reconnection(false)
  terminal.dispose()
})

window.addEventListener('resize', resize)
window.onunload = function () {
  if (terminal) terminal.dispose()
  if (socket) socket.disconnect()
}

function resize () {
  socket.emit('resize', { rows: terminal.rows, cols: terminal.cols })
  fitAddon.fit()
}
