/* msg2img v0.1
 *
 * Copyright (c) 2015 Robert Schindler
 *
 * License: MIT
 */

define(function (require) {
  var exports = {};

  this.encode = exports.encode = function (msg_buf)
  {
    var msg_arr8 = new Uint8ClampedArray(msg_buf);
    if (msg_arr8.length > Math.pow(256, 3))
      throw "message too long";
    // We need a buffer that is a multiple of 4 bytes long and can hold
    // msg + 3 bytes needed to store msg.length, and its length divided by 4
    // must be a square number (to get a square image).
    // Unfortunately, we can only use 3 of 4 bytes to store data in, because
    // the alpha channel must be 0xFF everywhere to ensure the browser
    // not "tunes" the image data, thus we geht a 33% overhead.
    var dimension = Math.ceil(Math.sqrt((1/3) * (3 + msg_arr8.length)));
    var buf_len = 4 * Math.pow(dimension, 2);
    var img_buf = new ArrayBuffer(buf_len);
    var img_arr8 = new Uint8ClampedArray(img_buf);

    // initialize array with 0xFF to ensure all alpha values are at maximum
    img_arr8.fill(0xFF);

    // in first 3 bytes of image, store the message length
    var img_arr32 = new Uint32Array(img_buf);
    img_arr32[0] = msg_arr8.length;
    // restore alpha to highest value
    img_arr8[3] = 0xFF;

    // start writing data at index 4 (5th byte)
    var i_msg = 0, i_img = 4;
    while (i_msg < msg_arr8.length)
    {
      for (var i = 0; i < 3; i ++, i_msg ++, i_img ++)
        img_arr8[i_img] = msg_arr8[i_msg];
      i_img ++;
    }

    // write results to canvas and convert it to data url
    var cv = document.createElement("canvas");
    cv.width = dimension;
    cv.height = dimension;
    var ctx = cv.getContext("2d");
    var image_data = new ImageData(img_arr8, dimension, dimension);
    ctx.putImageData(image_data, 0, 0);
    return cv.toDataURL("image/png");
  };

  this.decode = exports.decode = function (data_url, callback)
  {
    // load data url into Image object
    var image = new Image();
    image.onload = function (event) {
      var img_width = image.naturalWidth;
      var img_height = image.naturalHeight;

      // create canvas and use it to read raw data from image
      var cv = document.createElement("canvas");
      cv.width = img_width;
      cv.height = img_height;
      var ctx = cv.getContext("2d");
      ctx.drawImage(image, 0, 0);
      var image_data = ctx.getImageData(0, 0, img_width, img_height);
      var img_arr8 = image_data.data;

      // reset 4th byte (alpha value) to zero to make it properly readable
      // by Uint32Array
      img_arr8[3] = 0x00;
      // get message length from first 3 bytes
      var img_arr32 = new Uint32Array(img_arr8.buffer);
      var msg_len = img_arr32[0];

      // start reading data at index 4 (5th byte)
      var msg_buf = new ArrayBuffer(msg_len);
      var msg_arr8 = new Uint8ClampedArray(msg_buf);
      var i_msg = 0, i_img = 4;
      while (i_msg < msg_arr8.length)
      {
        for (var i = 0; i < 3; i ++, i_msg ++, i_img ++)
          msg_arr8[i_msg] = img_arr8[i_img];
        i_img ++;
      }

      // pass the message as array buffer to callback function
      callback(msg_buf);
    };
    image.src = data_url;
  };

  return exports;
});
