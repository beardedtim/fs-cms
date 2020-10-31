import path from 'path'
import { from } from 'rxjs'
import yml from 'js-yaml'
import cheerio from 'cheerio'

import { map, concatMap, filter } from 'rxjs/operators/index.js'
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

export const applyVariables = (vars) =>
  map((line) => {
    let new_line = line

    for (const { replace, value } of Object.values(vars)) {
      new_line = new_line.replace(
        new RegExp(`(\%\%${replace}\%\%)`, 'g'),
        value
      )
    }

    return new_line
  })

const removeEmptyBlocks = filter((line) => {
  const $ = cheerio.load(line)

  if ($('body').children().get(0)) {
    const el = $('body').children().get(0)
    return el.children.length > 0 || el.type !== 'img'
  }

  return true
})

export const applyTransformers = (vars = Vars) => (obs) => {
  return obs.pipe(expandIncludes, applyVariables(vars), removeEmptyBlocks)
}

export const transform_yml = yml.load
