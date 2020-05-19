<h1 align="center">
node-upload
</h1>

模拟浏览器上传(Simulate browser upload)

## Install

```bash
yarn add @kuckboy/node-upload
```

## Basic Usage

```js
import nodeUpload from "@kuckboy/node-upload";

const { host, accessid, signature, policy, dir, fileName } = await api();

nodeUpload({
  url: host, //url
  file: fileName, //文件位置
  param: "file", //文件上传字段名
  field: {
    name: fileName,
    OSSAccessKeyId: accessid,
    Signature: signature,
    policy: policy,
    key: `${dir}/${fileName}`,
    success_action_status: "200",
  },
});
```
