import * as path from 'path'
import * as fs from 'fs'
import * as http from 'http'
import * as url from 'url'

interface Ifield {
  [key: string]: string
}

interface Ioption {
  url: string
  file: string
  param: string
  boundary: string
  field: Ifield
}

interface IrequestHeaders {
  'Content-Length'?: number
  'Content-Type'?: string
}
interface IrequestParams extends url.UrlWithStringQuery {
  headers?: http.OutgoingHttpHeaders
  method?: 'POST'
}

//
const getfield = (field: string, value: string): string => {
  return `Content-Disposition: form-data; name="${field}"\r\n\r\n${value}\r\n`
}

// 获取Mime
const getMime = (filename: string): string => {
  const mimes = {
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'appliction/json',
    '.torrent': 'application/octet-stream',
  }
  const ext = path.extname(filename)
  let mime: string = mimes[ext]
  mime = mime || 'application/octet-stream'
  return mime
}

// 文件payload
const getfieldHead = (field: string, filename: string): string => {
  const fileFieldHead =
    `Content-Disposition: form-data; name="${field}"; filename="${filename}"\r\n` +
    `Content-Type: ${getMime(filename)}\r\n\r\n`
  return fileFieldHead
}

// 获取边界检查随机串
const getBoundary = () => {
  const max = 9007199254740992
  const dec = Math.random() * max
  const hex = dec.toString(36)
  const boundary = hex
  return boundary
}

// 获取boundary
const getBoundaryBorder = (boundary: string): string => {
  return `--${boundary}\r\n`
}

// 字段格式化
const fieldPayload = (opts: Ioption): string => {
  const payload: string[] = []
  Object.keys(opts.field).forEach((id) => {
    payload.push(getfield(id, opts.field[id]))
  })
  payload.push('')
  return payload.join(getBoundaryBorder(opts.boundary))
}
// 读取文件
const filereadstream = (
  opts: Ioption,
  fn: { (buffer: Buffer): void; (arg0: Buffer): void }
) => {
  const readstream = fs.createReadStream(opts.file, {
    flags: 'r',
    encoding: undefined,
  })
  const chunks: Buffer[] = []
  let length = 0
  readstream.on('data', (chunk: Buffer) => {
    length += chunk.length
    chunks.push(chunk)
  })
  readstream.on('end', () => {
    const buffer = Buffer.alloc(length)
    for (let i = 0, pos = 0, size = chunks.length; i < size; i += 1) {
      chunks[i].copy(buffer, pos)
      pos += chunks[i].length
    }
    fn(buffer)
  })
}

// post数据
const upload = (params: Ioption): void => {
  const opts = params
  opts.boundary = `----WebKitFormBoundary${getBoundary()}`
  filereadstream(opts, (buffer: Buffer) => {
    const options: IrequestParams = url.parse(opts.url)
    const Header: http.OutgoingHttpHeaders = {}
    const h = getBoundaryBorder(opts.boundary)
    const e = fieldPayload(opts)
    const a = getfieldHead(opts.param, opts.file)
    const d = `\r\n${h.replace('\r\n', '--\r\n')}` // warning
    Header['Content-Length'] = Buffer.byteLength(h + e + a + d) + buffer.length
    Header['Content-Type'] = `multipart/form-data; boundary=${opts.boundary}`
    options.headers = Header
    options.method = 'POST'
    // console.log(options)
    const req = http.request(options as http.RequestOptions, (res) => {
      let data: string = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        console.log(res.statusCode)
        console.log(data)
      })
    })
    req.write(h + e + a)
    req.write(buffer)
    req.end(d)
  })
}

export default upload
