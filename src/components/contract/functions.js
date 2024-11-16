


function toBytes32StrLength (str) {
  return toByteStrLength(str, 32);
}

function toByteStrLength (str, number) {
  let tempstr = str.replaceAll("0x", "");
  let length = tempstr.length;
  if (length > number * 2) throw Error("toByteStrLength length more than number");
  if (length < number * 2) {
    for (let i = 0; i < number * 2 - length; i++) tempstr = "0" + tempstr;
  }
  tempstr = "0x" + tempstr;
  return tempstr;
}

export function utf8ArrayToStr (utf8Bytes) {
  var unicodeStr = "";
  for (var pos = 0; pos < utf8Bytes.length;) {
    var flag = utf8Bytes[pos];
    var unicode = 0;
    if ((flag >>> 7) === 0) {
      unicodeStr += String.fromCharCode(utf8Bytes[pos]);
      pos += 1;

    } else if ((flag & 0xFC) === 0xFC) {
      unicode = (utf8Bytes[pos] & 0x3) << 30;
      unicode |= (utf8Bytes[pos + 1] & 0x3F) << 24;
      unicode |= (utf8Bytes[pos + 2] & 0x3F) << 18;
      unicode |= (utf8Bytes[pos + 3] & 0x3F) << 12;
      unicode |= (utf8Bytes[pos + 4] & 0x3F) << 6;
      unicode |= (utf8Bytes[pos + 5] & 0x3F);
      unicodeStr += String.fromCodePoint(unicode);
      pos += 6;

    } else if ((flag & 0xF8) === 0xF8) {
      unicode = (utf8Bytes[pos] & 0x7) << 24;
      unicode |= (utf8Bytes[pos + 1] & 0x3F) << 18;
      unicode |= (utf8Bytes[pos + 2] & 0x3F) << 12;
      unicode |= (utf8Bytes[pos + 3] & 0x3F) << 6;
      unicode |= (utf8Bytes[pos + 4] & 0x3F);
      unicodeStr += String.fromCodePoint(unicode);
      pos += 5;

    } else if ((flag & 0xF0) === 0xF0) {
      unicode = (utf8Bytes[pos] & 0xF) << 18;
      unicode |= (utf8Bytes[pos + 1] & 0x3F) << 12;
      unicode |= (utf8Bytes[pos + 2] & 0x3F) << 6;
      unicode |= (utf8Bytes[pos + 3] & 0x3F);
      unicodeStr += String.fromCodePoint(unicode);
      pos += 4;

    } else if ((flag & 0xE0) === 0xE0) {
      unicode = (utf8Bytes[pos] & 0x1F) << 12;;
      unicode |= (utf8Bytes[pos + 1] & 0x3F) << 6;
      unicode |= (utf8Bytes[pos + 2] & 0x3F);
      unicodeStr += String.fromCharCode(unicode);
      pos += 3;

    } else if ((flag & 0xC0) === 0xC0) { //110
      unicode = (utf8Bytes[pos] & 0x3F) << 6;
      unicode |= (utf8Bytes[pos + 1] & 0x3F);
      unicodeStr += String.fromCharCode(unicode);
      pos += 2;

    } else {
      unicodeStr += String.fromCharCode(utf8Bytes[pos]);
      pos += 1;
    }
  }
  return unicodeStr;
}

// Uint8Array([ 1, 15, 32 ]) => bytes 0x010f20(output as string "0x010f20")
var uint8ArrayToByteStr = function (uint8Array) {
  let str = "";
  for (let i = 0; i < uint8Array.length; i++) {
    let _hex;
    if (uint8Array[i] <= 15) {
      _hex = "0" + uint8Array[i].toString(16);
    } else {
      _hex = uint8Array[i].toString(16);
    }
    str = str + _hex;

  }
  return "0x" + str;
}

// bytes 0x010f20(input as string "0x010f20") => Uint8Array(3) [ 1, 15, 32 ]
export const byteStrToUint8Array = function (str) {
  str = str.replaceAll("0x", "");
  let length = str.length;
  if (length % 2 == 1) throw Error("Invalid string input1");
  /*
  0:48
  9:57

  A:65
  F:70

  a:97
  f:102

  */
  for (let i = 0; i < length; i++) {
    let num = str[i].charCodeAt();
    if (num < 48 || num > 57 && num < 65 || num > 70 && num < 97 || num > 102) throw Error("Invalid string input2");
  }

  let uint8Array = new Uint8Array(length / 2);

  let j = 0;
  for (let i = 0; i < length; i = i + 2) {
    let subStr = str.slice(i, i + 2);
    uint8Array[j++] = parseInt(subStr, 16);
  }
  return uint8Array;
}


// 与solidity的bytes(string)功能相同，生成的bytes也相同
// string "1234" => bytes 0x31323334(output as string "0x31323334")
// string "中文" => bytes 0xe4b8ade69687(output as string "0xe4b8ade69687");
var strToUtf8ByteStr = function (text) {
  const code = encodeURIComponent(text);  // string: %E6%88%91
  // console.log(typeof(code), code);
  const bytes = [];
  for (let i = 0; i < code.length; i++) {
    const c = code.charAt(i);
    if (c === '%') {
      const hex = code.charAt(i + 1) + code.charAt(i + 2);
      const hexval = parseInt(hex, 16);
      bytes.push(hexval);
      i += 2;
    } else {
      bytes.push(c.charCodeAt(0));
    }
  }
  // return bytes;  // [230, 123 ...]  每个字节的十进制表达
  // console.log(bytes);
  let bytesStr = "";
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] < 16) {
      bytesStr += "0" + bytes[i].toString(16);  // 不够1字节，前面补0占位
    } else {
      bytesStr += bytes[i].toString(16);
    }
  }
  bytesStr = "0x" + bytesStr;
  return bytesStr;  // "0x31e789..."
}



// https://github.com/emn178/js-sha3
const keccak256 = function (inputStringOrUint8Array) {

  var WINDOW = typeof window === 'object';
  var root = WINDOW ? window : {};

  var ARRAY_BUFFER = !root.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
  var HEX_CHARS = '0123456789abcdef'.split('');

  var KECCAK_PADDING = [1, 256, 65536, 16777216];

  var SHIFT = [0, 8, 16, 24];
  var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649,
    0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0,
    2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771,
    2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648,
    2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];
  var BITS = [224, 256, 384, 512];

  var OUTPUT_TYPES = ['hex', 'buffer', 'arrayBuffer', 'array', 'digest'];



  var isArray = root.JS_SHA3_NO_NODE_JS || !Array.isArray
    ? function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    }
    : Array.isArray;

  var isView = (ARRAY_BUFFER && (root.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView))
    ? function (obj) {
      return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
    }
    : ArrayBuffer.isView;

  // [message: string, isString: bool]
  var formatMessage = function (message) {
    var type = typeof message;
    if (type === 'string') {
      return [message, true];
    }
    if (type !== 'object' || message === null) {
      throw new Error(INPUT_ERROR);
    }
    if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
      return [new Uint8Array(message), false];
    }
    if (!isArray(message) && !isView(message)) {
      throw new Error(INPUT_ERROR);
    }
    return [message, false];
  }



  var createOutputMethod = function (bits, padding, outputType) {
    return function (message) {
      return new Keccak(bits, padding, bits).update(message)[outputType]();
    };
  };



  var createOutputMethods = function (method, createMethod, bits, padding) {
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createMethod(bits, padding, type);
    }
    return method;
  };

  var createMethod = function (bits, padding) {
    var method = createOutputMethod(bits, padding, 'hex');
    method.create = function () {
      return new Keccak(bits, padding, bits);
    };
    method.update = function (message) {
      return method.create().update(message);
    };
    return createOutputMethods(method, createOutputMethod, bits, padding);
  };


  var algorithms = [
    { name: 'keccak', padding: KECCAK_PADDING, bits: BITS, createMethod: createMethod },
  ];

  var methods = {}, methodNames = [];

  for (var i = 0; i < algorithms.length; ++i) {
    var algorithm = algorithms[i];
    var bits = algorithm.bits;
    for (var j = 0; j < bits.length; ++j) {
      var methodName = algorithm.name + '_' + bits[j];
      methodNames.push(methodName);
      methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);
      if (algorithm.name !== 'sha3') {
        var newMethodName = algorithm.name + bits[j];
        methodNames.push(newMethodName);
        methods[newMethodName] = methods[methodName];
      }
    }
  }

  function Keccak (bits, padding, outputBits) {
    this.blocks = [];
    this.s = [];
    this.padding = padding;
    this.outputBits = outputBits;
    this.reset = true;
    this.finalized = false;
    this.block = 0;
    this.start = 0;
    this.blockCount = (1600 - (bits << 1)) >> 5;
    this.byteCount = this.blockCount << 2;
    this.outputBlocks = outputBits >> 5;
    this.extraBytes = (outputBits & 31) >> 3;

    for (var i = 0; i < 50; ++i) {
      this.s[i] = 0;
    }
  }

  Keccak.prototype.update = function (message) {
    if (this.finalized) {
      throw new Error(FINALIZE_ERROR);
    }
    var result = formatMessage(message);
    message = result[0];
    var isString = result[1];
    var blocks = this.blocks, byteCount = this.byteCount, length = message.length,
      blockCount = this.blockCount, index = 0, s = this.s, i, code;

    while (index < length) {
      if (this.reset) {
        this.reset = false;
        blocks[0] = this.block;
        for (i = 1; i < blockCount + 1; ++i) {
          blocks[i] = 0;
        }
      }
      if (isString) {
        for (i = this.start; index < length && i < byteCount; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          }
        }
      } else {
        for (i = this.start; index < length && i < byteCount; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
        }
      }
      this.lastByteIndex = i;
      if (i >= byteCount) {
        this.start = i - byteCount;
        this.block = blocks[blockCount];
        for (i = 0; i < blockCount; ++i) {
          s[i] ^= blocks[i];
        }
        f(s);
        this.reset = true;
      } else {
        this.start = i;
      }
    }
    return this;
  };



  Keccak.prototype.finalize = function () {
    if (this.finalized) {
      return;
    }
    this.finalized = true;
    var blocks = this.blocks, i = this.lastByteIndex, blockCount = this.blockCount, s = this.s;
    blocks[i >> 2] |= this.padding[i & 3];
    if (this.lastByteIndex === this.byteCount) {
      blocks[0] = blocks[blockCount];
      for (i = 1; i < blockCount + 1; ++i) {
        blocks[i] = 0;
      }
    }
    blocks[blockCount - 1] |= 0x80000000;
    for (i = 0; i < blockCount; ++i) {
      s[i] ^= blocks[i];
    }
    f(s);
  };

  Keccak.prototype.toString = Keccak.prototype.hex = function () {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
      extraBytes = this.extraBytes, i = 0, j = 0;
    var hex = '', block;
    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        block = s[i];
        hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F] +
          HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F] +
          HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F] +
          HEX_CHARS[(block >> 28) & 0x0F] + HEX_CHARS[(block >> 24) & 0x0F];
      }
      if (j % blockCount === 0) {
        s = cloneArray(s);
        f(s);
        i = 0;
      }
    }
    if (extraBytes) {
      block = s[i];
      hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F];
      if (extraBytes > 1) {
        hex += HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F];
      }
      if (extraBytes > 2) {
        hex += HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F];
      }
    }
    return hex;
  };



  var f = function (s) {
    var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9,
      b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17,
      b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33,
      b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
    for (n = 0; n < 48; n += 2) {
      c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
      c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
      c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
      c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
      c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
      c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
      c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
      c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
      c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
      c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];

      h = c8 ^ ((c2 << 1) | (c3 >>> 31));
      l = c9 ^ ((c3 << 1) | (c2 >>> 31));
      s[0] ^= h;
      s[1] ^= l;
      s[10] ^= h;
      s[11] ^= l;
      s[20] ^= h;
      s[21] ^= l;
      s[30] ^= h;
      s[31] ^= l;
      s[40] ^= h;
      s[41] ^= l;
      h = c0 ^ ((c4 << 1) | (c5 >>> 31));
      l = c1 ^ ((c5 << 1) | (c4 >>> 31));
      s[2] ^= h;
      s[3] ^= l;
      s[12] ^= h;
      s[13] ^= l;
      s[22] ^= h;
      s[23] ^= l;
      s[32] ^= h;
      s[33] ^= l;
      s[42] ^= h;
      s[43] ^= l;
      h = c2 ^ ((c6 << 1) | (c7 >>> 31));
      l = c3 ^ ((c7 << 1) | (c6 >>> 31));
      s[4] ^= h;
      s[5] ^= l;
      s[14] ^= h;
      s[15] ^= l;
      s[24] ^= h;
      s[25] ^= l;
      s[34] ^= h;
      s[35] ^= l;
      s[44] ^= h;
      s[45] ^= l;
      h = c4 ^ ((c8 << 1) | (c9 >>> 31));
      l = c5 ^ ((c9 << 1) | (c8 >>> 31));
      s[6] ^= h;
      s[7] ^= l;
      s[16] ^= h;
      s[17] ^= l;
      s[26] ^= h;
      s[27] ^= l;
      s[36] ^= h;
      s[37] ^= l;
      s[46] ^= h;
      s[47] ^= l;
      h = c6 ^ ((c0 << 1) | (c1 >>> 31));
      l = c7 ^ ((c1 << 1) | (c0 >>> 31));
      s[8] ^= h;
      s[9] ^= l;
      s[18] ^= h;
      s[19] ^= l;
      s[28] ^= h;
      s[29] ^= l;
      s[38] ^= h;
      s[39] ^= l;
      s[48] ^= h;
      s[49] ^= l;

      b0 = s[0];
      b1 = s[1];
      b32 = (s[11] << 4) | (s[10] >>> 28);
      b33 = (s[10] << 4) | (s[11] >>> 28);
      b14 = (s[20] << 3) | (s[21] >>> 29);
      b15 = (s[21] << 3) | (s[20] >>> 29);
      b46 = (s[31] << 9) | (s[30] >>> 23);
      b47 = (s[30] << 9) | (s[31] >>> 23);
      b28 = (s[40] << 18) | (s[41] >>> 14);
      b29 = (s[41] << 18) | (s[40] >>> 14);
      b20 = (s[2] << 1) | (s[3] >>> 31);
      b21 = (s[3] << 1) | (s[2] >>> 31);
      b2 = (s[13] << 12) | (s[12] >>> 20);
      b3 = (s[12] << 12) | (s[13] >>> 20);
      b34 = (s[22] << 10) | (s[23] >>> 22);
      b35 = (s[23] << 10) | (s[22] >>> 22);
      b16 = (s[33] << 13) | (s[32] >>> 19);
      b17 = (s[32] << 13) | (s[33] >>> 19);
      b48 = (s[42] << 2) | (s[43] >>> 30);
      b49 = (s[43] << 2) | (s[42] >>> 30);
      b40 = (s[5] << 30) | (s[4] >>> 2);
      b41 = (s[4] << 30) | (s[5] >>> 2);
      b22 = (s[14] << 6) | (s[15] >>> 26);
      b23 = (s[15] << 6) | (s[14] >>> 26);
      b4 = (s[25] << 11) | (s[24] >>> 21);
      b5 = (s[24] << 11) | (s[25] >>> 21);
      b36 = (s[34] << 15) | (s[35] >>> 17);
      b37 = (s[35] << 15) | (s[34] >>> 17);
      b18 = (s[45] << 29) | (s[44] >>> 3);
      b19 = (s[44] << 29) | (s[45] >>> 3);
      b10 = (s[6] << 28) | (s[7] >>> 4);
      b11 = (s[7] << 28) | (s[6] >>> 4);
      b42 = (s[17] << 23) | (s[16] >>> 9);
      b43 = (s[16] << 23) | (s[17] >>> 9);
      b24 = (s[26] << 25) | (s[27] >>> 7);
      b25 = (s[27] << 25) | (s[26] >>> 7);
      b6 = (s[36] << 21) | (s[37] >>> 11);
      b7 = (s[37] << 21) | (s[36] >>> 11);
      b38 = (s[47] << 24) | (s[46] >>> 8);
      b39 = (s[46] << 24) | (s[47] >>> 8);
      b30 = (s[8] << 27) | (s[9] >>> 5);
      b31 = (s[9] << 27) | (s[8] >>> 5);
      b12 = (s[18] << 20) | (s[19] >>> 12);
      b13 = (s[19] << 20) | (s[18] >>> 12);
      b44 = (s[29] << 7) | (s[28] >>> 25);
      b45 = (s[28] << 7) | (s[29] >>> 25);
      b26 = (s[38] << 8) | (s[39] >>> 24);
      b27 = (s[39] << 8) | (s[38] >>> 24);
      b8 = (s[48] << 14) | (s[49] >>> 18);
      b9 = (s[49] << 14) | (s[48] >>> 18);

      s[0] = b0 ^ (~b2 & b4);
      s[1] = b1 ^ (~b3 & b5);
      s[10] = b10 ^ (~b12 & b14);
      s[11] = b11 ^ (~b13 & b15);
      s[20] = b20 ^ (~b22 & b24);
      s[21] = b21 ^ (~b23 & b25);
      s[30] = b30 ^ (~b32 & b34);
      s[31] = b31 ^ (~b33 & b35);
      s[40] = b40 ^ (~b42 & b44);
      s[41] = b41 ^ (~b43 & b45);
      s[2] = b2 ^ (~b4 & b6);
      s[3] = b3 ^ (~b5 & b7);
      s[12] = b12 ^ (~b14 & b16);
      s[13] = b13 ^ (~b15 & b17);
      s[22] = b22 ^ (~b24 & b26);
      s[23] = b23 ^ (~b25 & b27);
      s[32] = b32 ^ (~b34 & b36);
      s[33] = b33 ^ (~b35 & b37);
      s[42] = b42 ^ (~b44 & b46);
      s[43] = b43 ^ (~b45 & b47);
      s[4] = b4 ^ (~b6 & b8);
      s[5] = b5 ^ (~b7 & b9);
      s[14] = b14 ^ (~b16 & b18);
      s[15] = b15 ^ (~b17 & b19);
      s[24] = b24 ^ (~b26 & b28);
      s[25] = b25 ^ (~b27 & b29);
      s[34] = b34 ^ (~b36 & b38);
      s[35] = b35 ^ (~b37 & b39);
      s[44] = b44 ^ (~b46 & b48);
      s[45] = b45 ^ (~b47 & b49);
      s[6] = b6 ^ (~b8 & b0);
      s[7] = b7 ^ (~b9 & b1);
      s[16] = b16 ^ (~b18 & b10);
      s[17] = b17 ^ (~b19 & b11);
      s[26] = b26 ^ (~b28 & b20);
      s[27] = b27 ^ (~b29 & b21);
      s[36] = b36 ^ (~b38 & b30);
      s[37] = b37 ^ (~b39 & b31);
      s[46] = b46 ^ (~b48 & b40);
      s[47] = b47 ^ (~b49 & b41);
      s[8] = b8 ^ (~b0 & b2);
      s[9] = b9 ^ (~b1 & b3);
      s[18] = b18 ^ (~b10 & b12);
      s[19] = b19 ^ (~b11 & b13);
      s[28] = b28 ^ (~b20 & b22);
      s[29] = b29 ^ (~b21 & b23);
      s[38] = b38 ^ (~b30 & b32);
      s[39] = b39 ^ (~b31 & b33);
      s[48] = b48 ^ (~b40 & b42);
      s[49] = b49 ^ (~b41 & b43);

      s[0] ^= RC[n];
      s[1] ^= RC[n + 1];
    }
  };

  // 同solidity keccak256(abi.encodePacked(bytes))
  // 或solidity keccak256(abi.encodePacked(string))
  var hash = methods.keccak256.update(inputStringOrUint8Array);
  // console.log("0x" + hash.toString());
  return ("0x" + hash.toString());

};









// http://btc.mom/8875
// 已知曲线的x坐标，求y坐标，目前仅适用于a=0的曲线
// Calculate(x**y % z) efficiently
function powMod (x, y, z) {
  let number = 1n;
  while (y > 0n) {
    if (y & 1n) number = bigIntMod(number * x, z);
    y >>= 1n;
    x = bigIntMod(x * x, z);
  }
  return number;
}




// x % p
function bigIntMod (x, p) {
  if (p == 0n) {
    // console.log(p);
    throw Error("bigIntMod error");
  }
  if (p > 0n) {
    if (x < 0n) x = x + (-x * p);
    return x % p;
  }
  if (p < 0n) {
    if (x > 0n) x = x - (-x * p);
    return x % p;
  }
}

// x / p
function bigIntDiv (x, p) {
  if (p == 0n) throw Error("bigIntDiv error");
  if (p > 0n) {
    if (x < 0n) {
      let y = bigIntMod(x, p);
      x = x - y;
    };
    return x / p;
  }
  if (p < 0n) {
    if (x > 0n) {
      let y = bigIntMod(x, p);
      x = x - y;
    };
    return x / p;
  }
}

function extendedEuclideanAlgorithm (a, b) {
  /*
  Returns a three-tuple (gcd, x, y) such that
  a * x + b * y == gcd, where gcd is the greatest
  common divisor of a and b.
 
  This function implements the extended Euclidean
  algorithm and runs in O(log b) in the worst case.
  */
  let [s, old_s] = [0n, 1n];
  let [t, old_t] = [1n, 0n];
  let [r, old_r] = [b, a];

  while (r != 0n) {
    // let quotient = old_r / r;  // BigInt的整除
    let quotient = bigIntDiv(old_r, r);  // BigInt的整除
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
    [old_t, t] = [t, old_t - quotient * t];
  }

  return [old_r, old_s, old_t];
}

// console.log(extendedEuclideanAlgorithm(1234n, 1234567n));  // [ 1n, -37017n, 37n ]
// console.log(1234n - 1234567n);


function inverseOf (n, p) {
  /*
  Returns the multiplicative inverse of
  n modulo p.
 
  This function returns an integer m such that
  (n * m) % p == 1.
 
  */

  let [gcd, x, y] = extendedEuclideanAlgorithm(n, p);

  // assert (n * x + p * y) % p == gcd
  // if((n * x + p * y) % p !== gcd) throw Error("gcd error");
  if (bigIntMod((n * x + p * y), p) !== gcd) throw Error("gcd error");

  if (gcd !== 1n) {
    // # Either n is 0, or p is not a prime number.
    // raise ValueError(
    //     '{} has no multiplicative inverse '
    //     'modulo {}'.format(n, p))
    throw Error("no multiplicative inverse");
  } else {
    return bigIntMod(x, p);
  }
}
// console.log(inverseOf(1234n, 1234567n));  // 1197550n



function gcd (a, b) {
  if (b == 0n) return a;
  else {
    return gcd(b, bigIntMod(a, b));
  }
}

// console.log(gcd(-8n, 6n))


class CurveBabyJubJub {
  constructor() {
    // Curve parameters
    // E: 168700x^2 + y^2 = 1 + 168696x^2y^2
    this.A = 168700n;
    this.D = 168696n;
    this.Q = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
    this.L = 2736030358979909402780800718157159386076813972158567259200215660948447373041n;
    this.Base = [995203441582195749578291179787384436505546430278305826713579947235728471134n, 5472060717959818805561601436314318772137091100104008585924551046643952123905n];
    this.Base8 = [5299619240641551281634865583518297030282874472190772894086521144482721001553n, 16950150798460657717958625567821834550301663161624707787222815936182638968203n];
  }

  check_on_curve (point) {
    /**
     * Check if a given point is on the curve
     * (168700x^2 + y^2) - (1 + 168696x^2y^2) == 0
     */
    // if (bigIntMod((point[0] ** 3n + this.a * point[0] + this.b - point[1] ** 2n), this.p) === 0n) return true;
    // else return false;
    let _x = point[0];
    let _y = point[1];
    let xSq = bigIntMod(_x * _x, this.Q);
    let ySq = bigIntMod(_y * _y, this.Q);
    let lhs = bigIntMod(this.A * xSq + ySq, this.Q);
    let rhs = bigIntMod(1n + this.D * xSq * ySq, this.Q);
    return bigIntMod(lhs - rhs, this.Q) == 0n;
  }

  scalarMulFixBASE8 (n) {
    let _x1 = 5299619240641551281634865583518297030282874472190772894086521144482721001553n;
    let _y1 = 16950150798460657717958625567821834550301663161624707787222815936182638968203n;
    return this.scalarMulAny(n, [_x1, _y1]);
  }

  scalarMulAny (n, P) {
    if (this.check_on_curve(P) === false) throw Error("scalarMulAny Error");

    let _x1 = P[0];
    let _y1 = P[1];

    let remaining = n;

    let px = _x1;
    let py = _y1;
    let ax = 0n;
    let ay = 0n;

    while (remaining != 0n) {
      if ((remaining & 1n) != 0n) {
        // Binary digit is 1 so add
        [ax, ay] = this.add([ax, ay], [px, py]);
      }

      [px, py] = this.add([px, py], [px, py]);

      remaining = remaining / 2n;
    }

    return [ax, ay];
  }


  add (P1, P2) {
    let _x1 = P1[0];
    let _y1 = P1[1];
    let _x2 = P2[0];
    let _y2 = P2[1];

    if (_x1 == 0 && _y1 == 0) {
      return [_x2, _y2];
    }

    if (_x2 == 0 && _y1 == 0) {
      return [_x1, _y1];
    }

    let x1x2 = bigIntMod(_x1 * _x2, this.Q);
    let y1y2 = bigIntMod(_y1 * _y2, this.Q);
    let dx1x2y1y2 = bigIntMod(this.D * x1x2 * y1y2, this.Q);
    let x3Num = bigIntMod(_x1 * _y2 + _y1 * _x2, this.Q);
    let y3Num = bigIntMod(y1y2 - this.A * x1x2, this.Q);

    let x3 = bigIntMod(x3Num * inverseOf(1n + dx1x2y1y2, this.Q), this.Q);
    let y3 = bigIntMod(y3Num * inverseOf(1n - dx1x2y1y2, this.Q), this.Q);
    return [x3, y3];
  }

}



// 字符串
// [bigint,bigint]
export function parseKS (kS_str) {
  let kS = [BigInt(kS_str[0]), BigInt(kS_str[1])]


  // *************for test****************
  console.log("*************for test****************");
  console.log("*************for test****************");
  console.log("*************for test****************");

  let myCurve = new CurveBabyJubJub();

  let G_BASE8 = [5299619240641551281634865583518297030282874472190772894086521144482721001553n, 16950150798460657717958625567821834550301663161624707787222815936182638968203n];

  let H = [6735765341259699143139827009349789187539604393960868243100492584654517940357n, 1445652303469103813662583567528138751416053152308969014699137575678043505465n];  // unkown privkey

  let privkey_supervisor1_test = 9832849479912972753217183270094091783854435713592063788999276264576608862153n;
  let privkey_supervisor2_test = 12055393391926302469029222475163183304693928686823970554698927921999199633464n;

  // let privkey_supervisor_chainlink_test = BigInt("xxx");
  // let privkey_multi_test = bigIntMod(privkey_supervisor1_test * privkey_supervisor2_test * privkey_supervisor_chainlink_test, myCurve.L);


  // S = ["0x1a6ef912793139a54cbbe77ceff5acce3140b659744d1c516aad7682ba979199", "0x198f3a926b833efd0056926724c072fdcfb1ebb84e77e60daa14a1484070dd07"];
  let S = [11956206273172976588849604143238823558114836218641936603514727596464677556633n, 11560884593607702626218260308732086781907519001377422958857365922539830828295n]
  // let S = myCurve.scalarMulAny(privkey_multi_test, H);

  // E = ["0x1f76b93712e7dcb087468c1469e1f8425d17d265d2f870c9c22d9cb1399e5986", "0x2f7843eb4df4334d2f14a3a844c4430bee0ec46cfec755fcf02707f3a424f5fa"]
  let E = [14231464567587334110725661069232030606644409982773819778672427387682249660806n, 21471194291989132796077342379631293078979938952276276785637382826166545872378n]
  // let E = myCurve.scalarMulAny(privkey_multi_test, G_BASE8);



  // console.log("0x1a6ef912793139a54cbbe77ceff5acce3140b659744d1c516aad7682ba979199", BigInt("0x1a6ef912793139a54cbbe77ceff5acce3140b659744d1c516aad7682ba979199"));
  // console.log("0x1f76b93712e7dcb087468c1469e1f8425d17d265d2f870c9c22d9cb1399e5986", BigInt("0x1f76b93712e7dcb087468c1469e1f8425d17d265d2f870c9c22d9cb1399e5986"));



  // console.log("S hex");
  // console.log(toBytes32StrLength(S[0].toString(16)), toBytes32StrLength(S[1].toString(16)));
  // console.log("E hex");
  // console.log(toBytes32StrLength(E[0].toString(16)), toBytes32StrLength(E[1].toString(16)));


  // let privkey_user = 11956206273172976588849604143238823558114836218641936603514727596464677556633n;
  // let kH = myCurve.scalarMulAny(privkey_user, H);
  // console.log("kH", kH);
  // let kS = myCurve.scalarMulAny(privkey_user, S);

  // decryption
  let kH_1 = myCurve.scalarMulAny(inverseOf(privkey_supervisor1_test, myCurve.L), kS);
  let kH_2 = myCurve.scalarMulAny(inverseOf(privkey_supervisor2_test, myCurve.L), kH_1);
  // let kH_3 = myCurve.scalarMulAny(inverseOf(privkey_supervisor_chainlink_test, myCurve.L), kH_2);
  console.log("send kH_2 to Chanilink for final decryption", kH_2);
  console.log("kH_2 hex", [toBytes32StrLength(kH_2[0].toString(16)), toBytes32StrLength(kH_2[1].toString(16))]);


  return [toBytes32StrLength(kH_2[0].toString(16)), toBytes32StrLength(kH_2[1].toString(16))]

  // console.log();
  // console.log("kH_0_hex", toBytes32StrLength(kH[0].toString(16)));
  // console.log("kH_1_hex", toBytes32StrLength(kH[1].toString(16)));

  // console.log();
  // console.log("kH_2_0_hex", toBytes32StrLength(kH_2[0].toString(16)));
  // console.log("kH_2_1_hex", toBytes32StrLength(kH_2[1].toString(16)));




  // // let tt = toBytes32StrLength(privkey_user.toString(16));
  // // let ttt = BigInt(tt);
  // // console.log(tt);
  // // console.log(ttt);






}

