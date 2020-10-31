import * as Server from './src/http-server.js'

Server.start(5000, () => {
  console.log('Server Started at 5000')
})