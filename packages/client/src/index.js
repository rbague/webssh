import WebSSH from './webssh.js'

import './style.css'

window.addEventListener('load', function setup () {
  window.removeEventListener('load', setup)

  const params = new URLSearchParams(window.location.search)
  const webssh = new WebSSH(document.getElementById('terminal'), {
    url: 'http://localhost:2222',
    host: params.get('host'),
    port: params.get('port'),
    username: params.get('user'),
    password: params.get('passwd')
  })

  window.addEventListener('resize', webssh.resize)
  window.addEventListener('beforeunload', function cleanup () {
    webssh.dispose()

    window.removeEventListener('resize', webssh.resize)
    window.removeEventListener('beforeunload', cleanup)
  })
})
