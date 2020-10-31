import path from 'path'
import { from } from 'rxjs'
import markdownIt from 'markdown-it'

import { map, concatMap } from 'rxjs/operators/index.js'
import { readByLine } from './file-system.js'
import * as Constants from '../config/constants.js'
import * as Vars from '../config/vars.js'

const get_path_from_include = (line) =>
  path.join(
    Constants.FILE_ROOT_DIR,
    line.replace(`<!--#include '`, '').replace(`'-->`, '')
  )

export const withNewLine = map((line) => `${line}\n`)

const isIncludeLine = (line) => line.trim().indexOf('<!--#include') === 0

const flatMapIf = (pred, fn) =>
  concatMap((line) => {
    if (pred(line)) {
      return fn(line).pipe(applyTransformers)
    }

    return from([line])
  })

export const expandIncludes = flatMapIf(isIncludeLine, (line) =>
  readByLine(get_path_from_include(line))
)

export const applyVariables = map((line) => {
  let new_line = line

  for (const { replace, value } of Object.values(Vars)) {
    new_line = new_line.replace(replace, value)
  }

  return new_line
})

export const transformMarkdown = map((line) => {
  const renderer = markdownIt({
    html: true,
  })

  return renderer.render(line)
})

export const applyTransformers = (obs) => {
  return obs.pipe(expandIncludes, transformMarkdown, applyVariables)
}
