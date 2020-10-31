import http from 'http'
import path from 'path'
import crypto from 'crypto'
import { reduce, map } from 'rxjs/operators/index.js'
import * as FS from './file-system.js'
import * as Transformers from './file-transformers.js'
import * as Constants from '../config/constants.js'
import * as Vars from '../config/vars.js'

const is_req_to_file = (req) => FS.fileExists(get_path_from_req(req))
const get_path_from_req = ({ url }) => path.join(Constants.FILE_ROOT_DIR, url)

const is_req_to_a_person = (req) =>
  FS.fileExists(get_path_from_req(req) + '.person')
const get_person_from_req = (req) =>
  FS.read(get_path_from_req(req) + '.person').then(Transformers.transform_yml)

const handle_error = (res) => (err) => {
  console.error(err)

  res.statusCode = 500
  res.end('ERRORED OUT')
}

const handle_complete = (res) => () => {
  res.end()
}

const hash_file = (fileStr) =>
  crypto.createHash('sha1').update(fileStr).digest('hex')
const set_headers = (res, fileStr) => {
  res.setHeader('ETag', `"${hash_file(fileStr)}"`)
}
/**
 *
 * @param {import('http').ServerResponse} res
 */
const handle_file_complete = (res) => {
  const on_completed = handle_complete(res)

  return async (fileString) => {
    await set_headers(res, fileString)

    res.write(fileString)

    on_completed()
  }
}

const handle_closing_stream = (stream, res) => {
  const closeStream = stream.pipe(
    reduce((a, c) => a + c, ''),
    map(handle_file_complete(res))
  )

  closeStream.subscribe(() => {}, handle_error(res))
}

const send_file = async (req, res) => {
  const byLine = FS.readByLine(get_path_from_req(req))

  const transformationStream = byLine.pipe(
    Transformers.applyTransformers(Vars),
    Transformers.withNewLine
  )

  handle_closing_stream(transformationStream, res)
}

const get_person_template_path = () =>
  path.resolve(Constants.FILE_ROOT_DIR, 'templates', 'person.html')
const person_to_variables = (person) =>
  Object.entries(person).reduce(
    (a, c) => ({
      ...a,
      [c[0]]: {
        replace: c[0],
        value: c[1],
      },
    }),
    {}
  )

const send_person = async (req, res) => {
  const person = await get_person_from_req(req)
  const byLine = FS.readByLine(get_person_template_path())

  const transformationStream = byLine.pipe(
    Transformers.applyTransformers({ ...Vars, ...person_to_variables(person) }),
    Transformers.withNewLine
  )

  handle_closing_stream(transformationStream, res)
}

const server = http.createServer(async (req, res) => {
  if (await is_req_to_file(req)) {
    return send_file(req, res)
  } else if (await is_req_to_a_person(req)) {
    await send_person(req, res)
  } else {
    res.statusCode = 404
    res.end('Not Found')
  }
})

export const start = async (port, cb) => {
  server.listen(port, cb)
}
