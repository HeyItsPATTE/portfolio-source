import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const PUBLIC = join(process.cwd(), 'public')

const required = [
  'fonts/Newsreader-Variable.woff2',
  'fonts/Newsreader-Italic-Variable.woff2',
  'fonts/Geist-Variable.woff2',
  'fonts/GeistMono-Variable.woff2',
  'fonts/licenses/Newsreader-OFL.txt',
  'fonts/licenses/Geist-OFL.txt',
  'fonts/licenses/GeistMono-OFL.txt',
  'images/patrick-kraft.webp',
  'images/patrick-kraft-avatar.webp',
  'images/og.jpg',
]

/** Width and height from a JPEG's start-of-frame marker. */
function jpegSize(buf: Buffer): { width: number; height: number } | null {
  let i = 2
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i++
      continue
    }
    const marker = buf[i + 1]
    if (marker >= 0xc0 && marker <= 0xc3) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    i += 2 + buf.readUInt16BE(i + 2)
  }
  return null
}

describe('public assets', () => {
  it.each(required)('%s exists and is not empty', (file) => {
    const path = join(PUBLIC, file)
    expect(existsSync(path)).toBe(true)
    expect(statSync(path).size).toBeGreaterThan(0)
  })

  it('og.jpg is a 1200×630 JPEG', () => {
    const buf = readFileSync(join(PUBLIC, 'images/og.jpg'))
    expect([buf[0], buf[1]]).toEqual([0xff, 0xd8])
    expect(jpegSize(buf)).toEqual({ width: 1200, height: 630 })
  })
})
