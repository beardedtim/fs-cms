import http from 'http'
import path from 'path'
import * as FS from './file-system.js'
import * as Transformers from './file-transformers.js'
import * as Constants from '../config/constants.js'

const is_req_to_file = (req) => FS.fileExists(get_path_from_req(req))
const get_path_from_req = ({ url }) => path.join(Constants.FILE_ROOT_DIR, url)

const handle_data = (res) => (data) => res.write(data)

const handle_error = (res) => (err) => {
  res.statusCode = 404
  res.end('ERRORED OUT')
}

const handle_complete = (res) => () => res.end()

const send_file = async (req, res) => {
  const byLine = FS.readByLine(get_path_from_req(req))

  byLine
    .pipe(Transformers.applyTransformers, Transformers.withNewLine)
    .subscribe(handle_data(res), handle_error(res), handle_complete(res))
}

const server = http.createServer(async (req, res) => {
  const req_is_file = await is_req_to_file(req)

  if (req_is_file) {
    return send_file(req, res)
  } else {
    res.statusCode = 404
    res.end('Not Found')
  }
})

export const start = async (port, cb) => {
  server.listen(port, cb)
}
