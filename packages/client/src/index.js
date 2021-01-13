import WebSSH from './webssh.js'

import './style.css'

if (process.env.NODE_ENV === 'development') {
  window.addEventListener('load', function setup () {
    window.removeEventListener('load', setup)

    const params = new URLSearchParams(window.location.search)
    connect({
      url: 'http://localhost:2222',
      host: params.get('host'),
      port: params.get('port'),
      username: params.get('user'),
      password: params.get('passwd')
    })
  })
} else {
  /* global IFRAME_ORIGIN:readonly */
  const iframeOrigin = IFRAME_ORIGIN // populated by webpack.DefinePlugin in production mode
  window.addEventListener('message', function setup (event) {
    if (iframeOrigin && event.origin !== iframeOrigin) return
    if (event.data.type !== 'embed-webssh') return

    window.removeEventListener('message', setup)
    connect(event.data)
  }, false)
}

function connect (params) {
  const webssh = new WebSSH(document.getElementById('terminal'), params)

  window.addEventListener('resize', webssh.resize)
  window.addEventListener('beforeunload', function cleanup () {
    webssh.dispose()

    window.removeEventListener('resize', webssh.resize)
    window.removeEventListener('beforeunload', cleanup)
  })
}
