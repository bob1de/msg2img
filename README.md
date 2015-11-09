# msg2img
A JavaScript browser module for encoding arbitrary data into a PNG image.

It uses HTML5 `canvas` elements to draw images onto. However, the encoding and decoding takes place without attaching any elements to the DOM, so the whole process is completely invisible to the user.


## Build
*NOTE:* The module in msg2img.js is ready to be used in RequireJS environments. If you want to use it without an AMD capable system, use the msg2img_standalone.js file and load it via `<script>` tag.

The standalone module was built using browserify as follows:

```bash
npm install -g browserify
browserify -e msg2img.js -s msg2img -o msg2img_standalone.js
```

## Usage
Please note that the `encode` function takes an `ArrayBuffer` object and returns the data URL of the generated PNG image. The `decode` function works just the other way around.

```javascript
var msg2img = require("msg2img");
var msg = "Hello there, I am in the image!";

// Encode
var msgArr16 = new Uint16Array(msg.length);
for (var i = 0; i < msg.length; i ++)
  msgArr16[i] = msg.charCodeAt(i);
var imgDataURL = msg2img.encode(msgArr16.buffer);

// Decode
msgArr16 = new Uint16Array(msg2img.decode(imgDataURL));
msg = String.fromCharCode.apply(null, msgArr16);
```

## Tests
Coming soon. For now, just read the sources, they are short and easy to understand.
