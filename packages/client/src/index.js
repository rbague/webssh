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

window.addEventListener('resize', fitAddon.fit)
