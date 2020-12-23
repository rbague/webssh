import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'

import './style.css'
import 'xterm/css/xterm.css'

const fitAddon = new FitAddon()

const terminal = new Terminal({
  cursorBlink: true,
  bellStyle: 'sound',
  convertEol: true,
  screenReaderMode: false,
  tabStopWidth: 2
})
terminal.onTitleChange = title => { document.title = title }
terminal.prompt = function (newLine = true) {
  this.write(`${newLine ? '\r\n' : ''}$ `)
}
terminal.hasContent = function () {
  // do not count prompt as content (dollar + space)
  return this._core.buffer.x > 2
}
terminal.onData(data => {
  switch (data) {
    case '\r': // Enter
    case '\u0003': // Ctrl+C
      terminal.prompt()
      break
    case '\u0004': // Ctrl+D
      if (!terminal.hasContent()) {
        terminal.prompt()
      }
      break
    case '\u007F': // Backspace (DEL)
      if (terminal.hasContent()) {
        terminal.write('\b \b')
      }
      break
    default:
      terminal.write(data)
  }
})

terminal.loadAddon(new WebLinksAddon())
terminal.loadAddon(fitAddon)
terminal.open(document.getElementById('terminal'))

terminal.prompt(false)
terminal.focus()
fitAddon.fit()

window.addEventListener('resize', fitAddon.fit)
