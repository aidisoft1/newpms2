import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(__dirname, '..', 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)

function filePath(name: string) { return path.join(DATA_DIR, name + '.json') }

export const jsonFileStore = {
  read<T>(name: string, defaultValue: T): T {
    const p = filePath(name)
    try {
      if (!fs.existsSync(p)) { fs.writeFileSync(p, JSON.stringify(defaultValue, null, 2)); return defaultValue }
      const raw = fs.readFileSync(p, 'utf8')
      return JSON.parse(raw) as T
    } catch (e) { return defaultValue }
  },
  write<T>(name: string, data: T) {
    const p = filePath(name)
    fs.writeFileSync(p, JSON.stringify(data, null, 2))
  }
}
