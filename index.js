var path = require("path");
var fs = require("fs");
var http = require("http");

//post值payload
var getfield = function (field, value) {
  return `Content-Disposition: form-data; name="${field}"\r\n\r\n${value}\r\n`;
};

//文件payload
var getfieldHead = function (field, filename) {
  var fileFieldHead =
    'Content-Disposition: form-data; name="' +
    field +
    '"; filename="' +
    filename +
    '"\r\n' +
    "Content-Type: " +
    getMime(filename) +
    "\r\n\r\n";
  return fileFieldHead;
};
//获取Mime
var getMime = function (filename) {
  var mimes = {
    ".png": "image/png",
    ".gif": "image/gif",
    // '.gif': 'application/octet-stream'
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".js": "appliction/json",
    ".torrent": "application/octet-stream",
  };
  var ext = path.extname(filename);
  var mime = mimes[ext];
  mime = !!mime ? mime : "application/octet-stream";
  return mime;
};
//获取边界检查随机串
var getBoundary = function () {
  var max = 9007199254740992;
  var dec = Math.random() * max;
  var hex = dec.toString(36);
  var boundary = hex;
  return boundary;
};
//获取boundary
var getBoundaryBorder = function (boundary) {
  return "--" + boundary + "\r\n";
};
//字段格式化
function fieldPayload(opts) {
  var payload = [];
  for (var id in opts.field) {
    payload.push(getfield(id, opts.field[id]));
  }
  payload.push("");
  // console.log(payload)
  return payload.join(getBoundaryBorder(opts.boundary));
}

//post数据
function upload(opts) {
  opts.boundary = "----WebKitFormBoundary" + getBoundary();
  filereadstream(opts, function (buffer) {
    var options = require("url").parse(opts.url);
    var Header = {};
    var h = getBoundaryBorder(opts.boundary);
    var e = fieldPayload(opts);
    var a = getfieldHead(opts.param, opts.file);
    var d = "\r\n" + h.replace("\r\n", "--\r\n"); // warning
    Header["Content-Length"] = Buffer.byteLength(h + e + a + d) + buffer.length;
    Header["Content-Type"] = "multipart/form-data; boundary=" + opts.boundary;
    options.headers = Header;
    options.method = "POST";
    // console.log(options)
    var req = http.request(options, function (res) {
      var data = "";
      res.on("data", function (chunk) {
        data += chunk;
      });
      res.on("end", function () {
        console.log(res.statusCode);
        console.log(data);
      });
    });
    req.write(h + e + a);
    req.write(buffer);
    req.end(d);
  });
}
//读取文件
function filereadstream(opts, fn) {
  var readstream = fs.createReadStream(opts.file, {
    flags: "r",
    encoding: null,
  });
  var chunks = [];
  var length = 0;
  readstream.on("data", function (chunk) {
    length += chunk.length;
    chunks.push(chunk);
  });
  readstream.on("end", function () {
    var buffer = new Buffer(length);
    for (var i = 0, pos = 0, size = chunks.length; i < size; i++) {
      chunks[i].copy(buffer, pos);
      pos += chunks[i].length;
    }
    fn(buffer);
  });
}

module.exports = upload;
