import fs from 'fs/promises'
import fsCb from 'fs'
import readline from 'readline'

import { fromEvent } from 'rxjs'
import { takeUntil } from 'rxjs/operators/index.js'

export const read = (filePath) => fs.readFile(filePath, 'utf-8')

export const readStream = (filePath) => fsCb.createReadStream(filePath, 'utf8')

export const readByLine = (filePath) => {
  const rl = readline.createInterface({
    input: readStream(filePath),
  })

  return fromEvent(rl, 'line').pipe(takeUntil(fromEvent(rl, 'close')))
}

export const fileExists = (filePath) =>
  fs
    .access(filePath)
    .then(() => true)
    .catch(() => false)
