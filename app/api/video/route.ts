import { readFileSync, statSync } from 'fs'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const filePath = join(process.cwd(), 'public', 'demo.mp4')

  let stat: ReturnType<typeof statSync>
  try {
    stat = statSync(filePath)
  } catch {
    return new NextResponse('Video not found', { status: 404 })
  }

  const fileSize = stat.size
  const range = req.headers.get('range')

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-')
    const start = parseInt(startStr, 10)
    const end = endStr ? parseInt(endStr, 10) : Math.min(start + 1024 * 1024, fileSize - 1)
    const chunkSize = end - start + 1

    const buf = Buffer.alloc(chunkSize)
    const fd = require('fs').openSync(filePath, 'r')
    require('fs').readSync(fd, buf, 0, chunkSize, start)
    require('fs').closeSync(fd)

    return new NextResponse(buf, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Type': 'video/mp4',
      },
    })
  }

  const file = readFileSync(filePath)
  return new NextResponse(file, {
    status: 200,
    headers: {
      'Content-Length': String(fileSize),
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    },
  })
}
