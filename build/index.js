"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
var http = __importStar(require("http"));
var url = __importStar(require("url"));
//
var getfield = function (field, value) {
    return "Content-Disposition: form-data; name=\"" + field + "\"\r\n\r\n" + value + "\r\n";
};
// 获取Mime
var getMime = function (filename) {
    var mimes = {
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.js': 'appliction/json',
        '.torrent': 'application/octet-stream',
    };
    var ext = path.extname(filename);
    var mime = mimes[ext];
    mime = mime || 'application/octet-stream';
    return mime;
};
// 文件payload
var getfieldHead = function (field, filename) {
    var fileFieldHead = "Content-Disposition: form-data; name=\"" + field + "\"; filename=\"" + filename + "\"\r\n" +
        ("Content-Type: " + getMime(filename) + "\r\n\r\n");
    return fileFieldHead;
};
// 获取边界检查随机串
var getBoundary = function () {
    var max = 9007199254740992;
    var dec = Math.random() * max;
    var hex = dec.toString(36);
    var boundary = hex;
    return boundary;
};
// 获取boundary
var getBoundaryBorder = function (boundary) {
    return "--" + boundary + "\r\n";
};
// 字段格式化
var fieldPayload = function (opts) {
    var payload = [];
    Object.keys(opts.field).forEach(function (id) {
        payload.push(getfield(id, opts.field[id]));
    });
    payload.push('');
    return payload.join(getBoundaryBorder(opts.boundary));
};
// 读取文件
var filereadstream = function (opts, fn) {
    var readstream = fs.createReadStream(opts.file, {
        flags: 'r',
        encoding: undefined,
    });
    var chunks = [];
    var length = 0;
    readstream.on('data', function (chunk) {
        length += chunk.length;
        chunks.push(chunk);
    });
    readstream.on('end', function () {
        var buffer = Buffer.alloc(length);
        for (var i = 0, pos = 0, size = chunks.length; i < size; i += 1) {
            chunks[i].copy(buffer, pos);
            pos += chunks[i].length;
        }
        fn(buffer);
    });
};
// post数据
var upload = function (params) {
    var opts = params;
    opts.boundary = "----WebKitFormBoundary" + getBoundary();
    filereadstream(opts, function (buffer) {
        var options = url.parse(opts.url);
        var Header = {};
        var h = getBoundaryBorder(opts.boundary);
        var e = fieldPayload(opts);
        var a = getfieldHead(opts.param, opts.file);
        var d = "\r\n" + h.replace('\r\n', '--\r\n'); // warning
        Header['Content-Length'] = Buffer.byteLength(h + e + a + d) + buffer.length;
        Header['Content-Type'] = "multipart/form-data; boundary=" + opts.boundary;
        options.headers = Header;
        options.method = 'POST';
        // console.log(options)
        var req = http.request(options, function (res) {
            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                console.log(res.statusCode);
                console.log(data);
            });
        });
        req.write(h + e + a);
        req.write(buffer);
        req.end(d);
    });
};
exports.default = upload;
