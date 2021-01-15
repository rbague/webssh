# WebSSH

A Web SSH client powered by [xterm.js](https://github.com/xtermjs/xterm.js/), [socket.io](https://github.com/socketio/socket.io) and [ssh2](https://github.com/mscdex/ssh2).

> **_NOTE:_** This project provides just the very basic functionality required to connnect to a remote server, if you want/need more configuration, take a look at [billchurch's webssh2 project](https://github.com/billchurch/webssh2)

## Usage
The way this project is meant to be used is for you to run the server package as a standalone process, and implement the client in your project.
To run the *server*, build its docker image and run it as a daemon (you could also use a process manager, like [pm2](https://pm2.keymetrics.io/)):
```sh
git clone https://github.com/rbague/webssh.git
docker build -t webssh -f packages/server/Dockerfile .
docker run -d -p 2222:2222 webssh
```

To implement the *client* in your project, grab the [webssh.js](https://github.com/rbague/webssh/blob/master/packages/client/src/webssh.js) file from the client package and copy it in your project.

The exposed API is very simple, it is a class with two methods. The most simple example of how to use it:
```js
const webssh = new WebSSH(element, config)
window.addEventListener('resize', webssh.resize)
window.addEventListener('beforeunload', webssh.dispose)
```

### WebSSH
Exposed by `import WebSSH from './webssh.js'`

#### new WebSSH(element, config)
 - `element` (HTMLElement) where you want to place the terminal in your page
 - `options` (Object) with the SSH configuration

The available options are:
Key | Required | Default value | Description
--- | :---: | :---: | ---
url | `false` | Window.location.origin | Location of where the server package is listening to
host | `true` | - | IP or host of where you want to SSH to
port | `false` | 22 | SSH port of the server
username | `true` | - | Remote username
password | `true` | - | Remote user password

#### webssh.resize()
Ensures that the terminal fits in its containing element dimension and all the terminal content is displayed properly

```js
window.addEventListener('resize', webssh.resize)
```

#### webssh.dispose()
Closes the underlying socket connection and disposes the terminal

### Docker
We provide a docker configuration (client + server) to run the full project, and, although it is not meant to be used directly in production (for security reasons, as it would be open to everyone), you should be able to get a "production-ready" configuration in just a fer steps (see [security](#security))

### Development
Install all the dependencies (`yarn install`) and run `yarn dev`, both the `client` and `server` will be started and reloaded every time any of their files are changed. The compiled javascript bundle for the development build expects the configuration to be sent in the URL query.

The available parameters are:
Name | Required | Default value | Description
--- | :---: | :---: | ---
host | `true` | - | IP or host of the server where to SSH to
port | `false` | 22 | SSH port
user | `true` | - | SSH username
passwd | `true` | - | SSH password

## Security
If you intent to use the provided docker setup (`docker-compose.yml`) in a production environment, you should be aware that it doesn't provide any security features, and you should change how it is deployed to secure it. Here we list the minimum changes that you should apply to secure the environment:

### Client
Open `webpack.production.js` (in packages/client), and update `IFRAME_ORIGIN` from `undefined` to your iframe origin (host or IP:port), this way the client will only accept connections made from your iframe, and reject all the other ones.

### IFrame
To provide the credentials of the server you want to connect to, the client expects them to be sent with a message through the iframe (we provide an [example file](https://github.com/rbague/webssh/blob/master/examples/iframe.html) which needs a few changes to be more secure) using [Window.postMessage](https://developer.mozilla.org/docs/Web/API/Window/postMessage)

The `message` parameter must be an object with the following structure:
Key | Required | Default value | Description
--- | :---: | :---: | ---
type | `true` | embed-webssh | This exact value must be sent, otherwise the client will reject the message
host | `true` | - | The IP or host of the server where you want to SSH to
port | `false` | 22 | The SSH port of the server
username | `true` | - | SSH server remote username
password | `true` | - | SSH server remote user password

And you should also set the `targetOrigin` to match the origin of your iframe source (i.e. the docker container IP/host and port) to ensure the message is only sent to the intended receiver, passing in `*` like in the provided example should never be done in production.
> **_Note from the MDN docs:_** Always provide a specific targetOrigin, not *, if you know where the other window's document should be located. Failing to provide a specific target discloses the data you send to any interested malicious site

The most simple configuration looks like the following:

HTML:
```html
<iframe src="https://the.client.origin"></iframe>
```

JS:
```js
const iframe = document.querySelector('iframe')
iframe.contentWindow.postMessage({
  type: 'embed-webssh',
  host: '12.34.56.78',
  username: 'centos',
  password: 'secret'
}, 'https://the.client.origin')
```

### NGINX
Update `nginix.conf` to allow iframes only from your origin
```apacheconf
add_header X-Frame-Options "ALLOW-FROM https://your.iframe.origin";
```

and change the configuration to only accept secure connections (https - [NGINX docs](https://nginx.org/docs/http/configuring_https_servers.html))
```diff
- listen 80 default_server;
- listen [::]:80 default_server;
- server_name _;
+ listen 443 ssl default_server;
+ listen [::]:443 ssl default_server;
+ server_name webssh.domain.tld;
+
+ ssl_certificate /certs/certificate.crt;
+ ssl_certificate_key /certs/certificate.key;
```
which also requires you to update the `docker-compose.yml` file to mount the certificates to the client container:
```yml
client:
  ...
  volumes:
    - "path/to/certs:/certs"
```

If you want more security, you should also consider to apply a [Content Security Policy](https://developer.mozilla.org/docs/Web/HTTP/CSP), enable [http2](https://www.nginx.com/blog/http2-module-nginx) or restrict [IP access](https://docs.nginx.com/nginx/admin-guide/security-controls/controlling-access-proxied-tcp/), just to name a few

## Future tasks
- [ ] Add server logging
- [ ] Push server docker image to Docker Hub?
- [ ] Privode npm package for the client (`webssh.js`)?

## Contributing
Bug reports and pull requests are more than welcome on [GitHub](https://github.com/rbague/webssh).

### Coding standards
This project uses Standard to minimize bike shedding related to code formatting.

Please run `yarn format` prior submitting pull requests.

## License
The software is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
