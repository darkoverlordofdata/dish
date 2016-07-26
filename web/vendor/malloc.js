var malloc = {};
(function(exports) {
'use strict';
//var exports = window;
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepare = prepare;
exports.verifyHeader = verifyHeader;
exports.checkListIntegrity = checkListIntegrity;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var POINTER_SIZE_IN_BYTES = 4;
var MAX_HEIGHT = 32;

var HEADER_SIZE_IN_QUADS = 1 + MAX_HEIGHT * 2;
var HEADER_OFFSET_IN_QUADS = 1;

var HEIGHT_OFFSET_IN_QUADS = 0;
var PREV_OFFSET_IN_QUADS = 1;
var NEXT_OFFSET_IN_QUADS = 2;

var POINTER_SIZE_IN_QUADS = 1;
var POINTER_OVERHEAD_IN_QUADS = 2;

var MIN_FREEABLE_SIZE_IN_QUADS = 3;
var FIRST_BLOCK_OFFSET_IN_QUADS = HEADER_OFFSET_IN_QUADS + HEADER_SIZE_IN_QUADS + POINTER_OVERHEAD_IN_QUADS;

var MIN_FREEABLE_SIZE_IN_BYTES = 16;
var FIRST_BLOCK_OFFSET_IN_BYTES = FIRST_BLOCK_OFFSET_IN_QUADS * POINTER_SIZE_IN_BYTES;
var OVERHEAD_IN_BYTES = (FIRST_BLOCK_OFFSET_IN_QUADS + 1) * POINTER_SIZE_IN_BYTES;

var ALIGNMENT_IN_BYTES = 8;
var ALIGNMENT_MASK = ALIGNMENT_IN_BYTES - 1;

var UPDATES = new Int32Array(MAX_HEIGHT).fill(HEADER_OFFSET_IN_QUADS);

var Allocator = function () {

  /**
   * Initialize the allocator from the given Buffer or ArrayBuffer.
   */

  function Allocator(buffer) {
    var byteOffset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var byteLength = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    _classCallCheck(this, Allocator);

    // if (buffer instanceof Buffer) {
    //   this.buffer = buffer.buffer;
    //   this.byteOffset = buffer.byteOffset + byteOffset;
    //   this.byteLength = byteLength === 0 ? buffer.length : byteLength;
    // } else 
    if (buffer instanceof ArrayBuffer) {
      this.buffer = buffer;
      this.byteOffset = byteOffset;
      this.byteLength = byteLength === 0 ? buffer.byteLength - byteOffset : byteLength;
    } else {
      throw new TypeError('Expected buffer to be an instance of Buffer or ArrayBuffer');
    }

    this.int32Array = prepare(new Int32Array(this.buffer, this.byteOffset, bytesToQuads(this.byteLength)));
    checkListIntegrity(this.int32Array);
  }

  /**
   * Allocate a given number of bytes and return the offset.
   * If allocation fails, returns 0.
   */

  _createClass(Allocator, [{
    key: 'alloc',
    value: function alloc(numberOfBytes) {

      numberOfBytes = align(numberOfBytes);

      if (numberOfBytes < MIN_FREEABLE_SIZE_IN_BYTES) {
        numberOfBytes = MIN_FREEABLE_SIZE_IN_BYTES;
      } else if (numberOfBytes > this.byteLength) {
        throw new RangeError('Allocation size must be between ' + MIN_FREEABLE_SIZE_IN_BYTES + ' bytes and ' + (this.byteLength - OVERHEAD_IN_BYTES) + ' bytes');
      }

      var minimumSize = bytesToQuads(numberOfBytes);
      var int32Array = this.int32Array;
      var block = findFreeBlock(int32Array, minimumSize);
      if (block <= HEADER_OFFSET_IN_QUADS) {
        return 0;
      }
      var blockSize = readSize(int32Array, block);

      if (blockSize - (minimumSize + POINTER_OVERHEAD_IN_QUADS) >= MIN_FREEABLE_SIZE_IN_QUADS) {
        split(int32Array, block, minimumSize, blockSize);
      } else {
        remove(int32Array, block, blockSize);
      }

      return quadsToBytes(block);
    }

    /**
     * Allocate and clear the given number of bytes and return the offset.
     * If allocation fails, returns 0.
     */

  }, {
    key: 'calloc',
    value: function calloc(numberOfBytes) {

      if (numberOfBytes < MIN_FREEABLE_SIZE_IN_BYTES) {
        numberOfBytes = MIN_FREEABLE_SIZE_IN_BYTES;
      } else {
        numberOfBytes = align(numberOfBytes);
      }

      var address = this.alloc(numberOfBytes);
      if (address === 0) {
        // Not enough space
        return 0;
      }
      var int32Array = this.int32Array;
      var offset = bytesToQuads(address);
      var limit = numberOfBytes / 4;
      for (var i = 0; i < limit; i++) {
        int32Array[offset + i] = 0;
      }
      return address;
    }

    /**
     * Free a number of bytes from the given address.
     */

  }, {
    key: 'free',
    value: function free(address) {

      if ((address & ALIGNMENT_MASK) !== 0) {
        throw new RangeError('Address must be a multiple of (' + ALIGNMENT_IN_BYTES + ').');
      }

      if (address < FIRST_BLOCK_OFFSET_IN_BYTES || address > this.byteLength) {
        throw new RangeError('Address must be between ' + FIRST_BLOCK_OFFSET_IN_BYTES + ' and ' + (this.byteLength - OVERHEAD_IN_BYTES));
      }

      var int32Array = this.int32Array;
      var block = bytesToQuads(address);

      var blockSize = readSize(int32Array, block);

      /* istanbul ignore if  */
      if (blockSize < MIN_FREEABLE_SIZE_IN_QUADS || blockSize > (this.byteLength - OVERHEAD_IN_BYTES) / 4) {
        throw new RangeError('Invalid block: ' + block + ', got block size: ' + quadsToBytes(blockSize));
      }

      var preceding = getFreeBlockBefore(int32Array, block);
      var trailing = getFreeBlockAfter(int32Array, block);
      if (preceding !== 0) {
        if (trailing !== 0) {
          return quadsToBytes(insertMiddle(int32Array, preceding, block, blockSize, trailing));
        } else {
          return quadsToBytes(insertAfter(int32Array, preceding, block, blockSize));
        }
      } else if (trailing !== 0) {
        return quadsToBytes(insertBefore(int32Array, trailing, block, blockSize));
      } else {
        return quadsToBytes(insert(int32Array, block, blockSize));
      }
    }

    /**
     * Return the size of the block at the given address.
     */

  }, {
    key: 'sizeOf',
    value: function sizeOf(address) {
      if (address < FIRST_BLOCK_OFFSET_IN_BYTES || address > this.byteLength || typeof address !== 'number' || isNaN(address)) {
        throw new RangeError('Address must be between ' + FIRST_BLOCK_OFFSET_IN_BYTES + ' and ' + (this.byteLength - OVERHEAD_IN_BYTES));
      }

      if ((address & ALIGNMENT_MASK) !== 0) {
        throw new RangeError('Address must be a multiple of the pointer size (' + POINTER_SIZE_IN_BYTES + ').');
      }

      return quadsToBytes(readSize(this.int32Array, bytesToQuads(address)));
    }

    /**
     * Inspect the instance.
     */

  }, {
    key: 'inspect',
    value: function inspect() {
      return _inspect(this.int32Array);
    }
  }]);

  return Allocator;
}();

/**
 * Prepare the given int32Array and ensure it contains a valid header.
 */

exports.default = Allocator;
function prepare(int32Array) {
  if (!verifyHeader(int32Array)) {
    writeInitialHeader(int32Array);
  }
  return int32Array;
}

/**
 * Verify that the int32Array contains a valid header.
 */
function verifyHeader(int32Array) {
  return int32Array[HEADER_OFFSET_IN_QUADS - 1] === HEADER_SIZE_IN_QUADS && int32Array[HEADER_OFFSET_IN_QUADS + HEADER_SIZE_IN_QUADS] === HEADER_SIZE_IN_QUADS;
}

/**
 * Write the initial header for an empty int32Array.
 */
function writeInitialHeader(int32Array) {
  var header = HEADER_OFFSET_IN_QUADS;
  var headerSize = HEADER_SIZE_IN_QUADS;
  var block = FIRST_BLOCK_OFFSET_IN_QUADS;
  var blockSize = int32Array.length - (header + headerSize + POINTER_OVERHEAD_IN_QUADS + POINTER_SIZE_IN_QUADS);

  writeFreeBlockSize(int32Array, headerSize, header);
  int32Array[header + HEIGHT_OFFSET_IN_QUADS] = 1;
  int32Array[header + NEXT_OFFSET_IN_QUADS] = block;
  for (var _height = 1; _height < MAX_HEIGHT; _height++) {
    int32Array[header + NEXT_OFFSET_IN_QUADS + _height] = HEADER_OFFSET_IN_QUADS;
  }

  writeFreeBlockSize(int32Array, blockSize, block);
  int32Array[block + HEIGHT_OFFSET_IN_QUADS] = 1;
  int32Array[block + NEXT_OFFSET_IN_QUADS] = header;
}

/**
 * Check the integrity of the freelist in the given array.
 */
function checkListIntegrity(int32Array) {
  var block = FIRST_BLOCK_OFFSET_IN_QUADS;
  while (block < int32Array.length - POINTER_SIZE_IN_QUADS) {
    var _size = readSize(int32Array, block);
    /* istanbul ignore if  */
    if (_size < POINTER_OVERHEAD_IN_QUADS || _size >= int32Array.length - FIRST_BLOCK_OFFSET_IN_QUADS) {
      throw new Error('Got invalid sized chunk at ' + quadsToBytes(block) + ' (' + quadsToBytes(_size) + ' bytes).');
    } else if (isFree(int32Array, block)) {
      checkFreeBlockIntegrity(int32Array, block, _size);
    } else {
      checkUsedBlockIntegrity(int32Array, block, _size);
    }
    block += _size + POINTER_OVERHEAD_IN_QUADS;
  }
  return true;
}

function checkFreeBlockIntegrity(int32Array, block, blockSize) {
  /* istanbul ignore if  */
  if (int32Array[block - 1] !== int32Array[block + blockSize]) {
    throw new Error('Block length header does not match footer (' + quadsToBytes(int32Array[block - 1]) + ' vs ' + quadsToBytes(int32Array[block + blockSize]) + ').');
  }
  var height = int32Array[block + HEIGHT_OFFSET_IN_QUADS];
  /* istanbul ignore if  */
  if (height < 1 || height > MAX_HEIGHT) {
    throw new Error('Block ' + quadsToBytes(block) + ' height must be between 1 and ' + MAX_HEIGHT + ', got ' + height + '.');
  }
  for (var i = 0; i < height; i++) {
    var pointer = int32Array[block + NEXT_OFFSET_IN_QUADS + i];
    /* istanbul ignore if  */
    if (pointer >= FIRST_BLOCK_OFFSET_IN_QUADS && !isFree(int32Array, pointer)) {
      throw new Error('Block ' + quadsToBytes(block) + ' has a pointer to a non-free block (' + quadsToBytes(pointer) + ').');
    }
  }
  return true;
}

function checkUsedBlockIntegrity(int32Array, block, blockSize) {
  /* istanbul ignore if  */
  if (int32Array[block - 1] !== int32Array[block + blockSize]) {
    throw new Error('Block length header does not match footer (' + quadsToBytes(int32Array[block - 1]) + ' vs ' + quadsToBytes(int32Array[block + blockSize]) + ').');
  } else {
    return true;
  }
}

/**
 * Inspect the freelist in the given array.
 */
function _inspect(int32Array) {
  var blocks = [];
  var header = readListNode(int32Array, HEADER_OFFSET_IN_QUADS);
  var block = FIRST_BLOCK_OFFSET_IN_QUADS;
  while (block < int32Array.length - POINTER_SIZE_IN_QUADS) {
    var _size2 = readSize(int32Array, block);
    /* istanbul ignore if  */
    if (_size2 < POINTER_OVERHEAD_IN_QUADS || _size2 >= int32Array.length) {
      throw new Error('Got invalid sized chunk at ' + quadsToBytes(block) + ' (' + quadsToBytes(_size2) + ')');
    }
    if (isFree(int32Array, block)) {
      // Issue todo
      blocks.push(readListNode(int32Array, block));
    } else {
      blocks.push({
        type: 'used',
        offset: quadsToBytes(block),
        size: quadsToBytes(_size2)
      });
    }
    block += _size2 + POINTER_OVERHEAD_IN_QUADS;
  }
  return { header: header, blocks: blocks };
}

/**
 * Convert quads to bytes.
 */
exports.inspect = _inspect;
function quadsToBytes(num) {
  return num * POINTER_SIZE_IN_BYTES;
}

/**
 * Convert bytes to quads.
 */
function bytesToQuads(num) {
  return Math.ceil(num / POINTER_SIZE_IN_BYTES);
}

/**
 * Align the given value to 8 bytes.
 */
function align(value) {
  return value + ALIGNMENT_MASK & ~ALIGNMENT_MASK;
}

/**
 * Read the list pointers for a given block.
 */
function readListNode(int32Array, block) {

  var height = int32Array[block + HEIGHT_OFFSET_IN_QUADS];
  var pointers = [];
  for (var i = 0; i < height; i++) {
    pointers.push(quadsToBytes(int32Array[block + NEXT_OFFSET_IN_QUADS + i]));
  }

  return {
    type: 'free',
    offset: quadsToBytes(block),
    height: height,
    pointers: pointers,
    size: quadsToBytes(int32Array[block - 1])
  };
}

/**
 * Read the size (in quads) of the block at the given address.
 */
function readSize(int32Array, block) {
  return Math.abs(int32Array[block - 1]);
}

/**
 * Write the size of the block at the given address.
 * Note: This ONLY works for free blocks, not blocks in use.
 */
function writeFreeBlockSize(int32Array, size, block) {

  int32Array[block - 1] = size;
  int32Array[block + size] = size;
}

/**
 * Populate the `UPDATES` array with the offset of the last item in each
 * list level, *before* a node of at least the given size.
 */
function findPredecessors(int32Array, minimumSize) {

  var listHeight = int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS];

  var node = HEADER_OFFSET_IN_QUADS;

  for (var _height2 = listHeight; _height2 > 0; _height2--) {
    var next = node + NEXT_OFFSET_IN_QUADS + (_height2 - 1);
    while (int32Array[next] >= FIRST_BLOCK_OFFSET_IN_QUADS && int32Array[int32Array[next] - 1] < minimumSize) {
      node = int32Array[next];
      next = node + NEXT_OFFSET_IN_QUADS + (_height2 - 1);
    }
    UPDATES[_height2 - 1] = node;
  }
}

/**
 * Find a free block with at least the given size and return its offset in quads.
 */
function findFreeBlock(int32Array, minimumSize) {

  var block = HEADER_OFFSET_IN_QUADS;

  for (var _height3 = int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS]; _height3 > 0; _height3--) {
    var next = int32Array[block + NEXT_OFFSET_IN_QUADS + (_height3 - 1)];

    while (next !== HEADER_OFFSET_IN_QUADS && int32Array[next - 1] < minimumSize) {
      block = next;
      next = int32Array[block + NEXT_OFFSET_IN_QUADS + (_height3 - 1)];
    }
  }

  block = int32Array[block + NEXT_OFFSET_IN_QUADS];
  if (block === HEADER_OFFSET_IN_QUADS) {
    return block;
  } else {
    return block;
  }
}

/**
 * Split the given block after a certain number of bytes and add the second half to the freelist.
 */
function split(int32Array, block, firstSize, blockSize) {

  var second = block + firstSize + POINTER_OVERHEAD_IN_QUADS;
  var secondSize = blockSize - (second - block);

  remove(int32Array, block, blockSize);

  int32Array[block - 1] = -firstSize;
  int32Array[block + firstSize] = -firstSize;

  int32Array[second - 1] = -secondSize;
  int32Array[second + secondSize] = -secondSize;

  insert(int32Array, second, secondSize);
}

/**
 * Remove the given block from the freelist and mark it as allocated.
 */
function remove(int32Array, block, blockSize) {
  findPredecessors(int32Array, blockSize);

  var node = int32Array[UPDATES[0] + NEXT_OFFSET_IN_QUADS];

  while (node !== block && node !== HEADER_OFFSET_IN_QUADS && int32Array[node - 1] <= blockSize) {
    for (var _height4 = int32Array[node + HEIGHT_OFFSET_IN_QUADS] - 1; _height4 >= 0; _height4--) {
      if (int32Array[node + NEXT_OFFSET_IN_QUADS + _height4] === block) {
        UPDATES[_height4] = node;
      }
    }
    node = int32Array[node + NEXT_OFFSET_IN_QUADS];
  }

  /* istanbul ignore if  */
  if (node !== block) {
    throw new Error('Could not find block to remove.');
  }

  var listHeight = int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS];
  for (var _height5 = 0; _height5 < listHeight; _height5++) {
    var next = int32Array[UPDATES[_height5] + NEXT_OFFSET_IN_QUADS + _height5];
    if (next !== block) {
      break;
    }
    int32Array[UPDATES[_height5] + NEXT_OFFSET_IN_QUADS + _height5] = int32Array[block + NEXT_OFFSET_IN_QUADS + _height5];
  }

  while (listHeight > 0 && int32Array[HEADER_OFFSET_IN_QUADS + NEXT_OFFSET_IN_QUADS + (listHeight - 1)] === HEADER_OFFSET_IN_QUADS) {
    listHeight--;
    int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS] = listHeight;
  }
  // invert the size sign to signify an allocated block
  int32Array[block - 1] = -blockSize;
  int32Array[block + blockSize] = -blockSize;
}

/**
 * Iterate all of the free blocks in the list, looking for pointers to the given block.
 */
function hasPointersTo(int32Array, block) {
  var next = FIRST_BLOCK_OFFSET_IN_QUADS;

  while (next < int32Array.length - POINTER_SIZE_IN_QUADS) {
    if (isFree(int32Array, next)) {
      for (var _height6 = int32Array[next + HEIGHT_OFFSET_IN_QUADS] - 1; _height6 >= 0; _height6--) {
        var pointer = int32Array[next + NEXT_OFFSET_IN_QUADS + _height6];
        /* istanbul ignore if  */
        if (pointer === block) {
          return true;
        }
      }
    }
    next += readSize(int32Array, next) + POINTER_OVERHEAD_IN_QUADS;
  }
  return false;
}

/**
 * Determine whether the block at the given address is free or not.
 */
function isFree(int32Array, block) {

  /* istanbul ignore if  */
  if (block < HEADER_SIZE_IN_QUADS) {
    return false;
  }

  var size = int32Array[block - POINTER_SIZE_IN_QUADS];

  if (size < 0) {
    return false;
  } else {
    return true;
  }
}

/**
 * Get the address of the block before the given one and return the address *if it is free*,
 * otherwise 0.
 */
function getFreeBlockBefore(int32Array, block) {

  if (block <= FIRST_BLOCK_OFFSET_IN_QUADS) {
    return 0;
  }
  var beforeSize = int32Array[block - POINTER_OVERHEAD_IN_QUADS];

  if (beforeSize < POINTER_OVERHEAD_IN_QUADS) {
    return 0;
  }
  return block - (POINTER_OVERHEAD_IN_QUADS + beforeSize);
}

/**
 * Get the address of the block after the given one and return its address *if it is free*,
 * otherwise 0.
 */
function getFreeBlockAfter(int32Array, block) {

  var blockSize = readSize(int32Array, block);
  if (block + blockSize + POINTER_OVERHEAD_IN_QUADS >= int32Array.length - 2) {
    // Block is the last in the list.
    return 0;
  }
  var next = block + blockSize + POINTER_OVERHEAD_IN_QUADS;
  var nextSize = int32Array[next - POINTER_SIZE_IN_QUADS];

  if (nextSize < POINTER_OVERHEAD_IN_QUADS) {
    return 0;
  }
  return next;
}

/**
 * Insert the given block into the freelist and return the number of bytes that were freed.
 */
function insert(int32Array, block, blockSize) {

  findPredecessors(int32Array, blockSize);

  var blockHeight = generateHeight(int32Array, block, blockSize);
  var listHeight = int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS];

  for (var _height7 = 1; _height7 <= blockHeight; _height7++) {
    var update = UPDATES[_height7 - 1] + NEXT_OFFSET_IN_QUADS + (_height7 - 1);

    int32Array[block + NEXT_OFFSET_IN_QUADS + (_height7 - 1)] = int32Array[update];
    int32Array[update] = block;
    UPDATES[_height7 - 1] = HEADER_OFFSET_IN_QUADS;
  }

  int32Array[block - 1] = blockSize;
  int32Array[block + blockSize] = blockSize;
  return blockSize;
}

/**
 * Insert the given block into the freelist before the given free block,
 * joining them together, returning the number of bytes which were freed.
 */
function insertBefore(int32Array, trailing, block, blockSize) {

  var trailingSize = readSize(int32Array, trailing);

  remove(int32Array, trailing, trailingSize);
  var size = blockSize + trailingSize + POINTER_OVERHEAD_IN_QUADS;
  int32Array[block - POINTER_SIZE_IN_QUADS] = -size;
  int32Array[trailing + trailingSize] = -size;
  insert(int32Array, block, size);
  return blockSize;
}

/**
 * Insert the given block into the freelist in between the given free blocks,
 * joining them together, returning the number of bytes which were freed.
 */
function insertMiddle(int32Array, preceding, block, blockSize, trailing) {

  var precedingSize = readSize(int32Array, preceding);
  var trailingSize = readSize(int32Array, trailing);
  var size = trailing - preceding + trailingSize;

  remove(int32Array, preceding, precedingSize);
  remove(int32Array, trailing, trailingSize);
  int32Array[preceding - POINTER_SIZE_IN_QUADS] = -size;
  int32Array[trailing + trailingSize] = -size;
  insert(int32Array, preceding, size);
  return blockSize;
}

/**
 * Insert the given block into the freelist after the given free block,
 * joining them together, returning the number of bytes which were freed.
 */
function insertAfter(int32Array, preceding, block, blockSize) {

  var precedingSize = block - preceding - POINTER_OVERHEAD_IN_QUADS;

  var size = block - preceding + blockSize;
  remove(int32Array, preceding, precedingSize);
  int32Array[preceding - POINTER_SIZE_IN_QUADS] = -size;
  int32Array[block + blockSize] = -size;
  insert(int32Array, preceding, size);
  return blockSize;
}

/**
 * Generate a random height for a block, growing the list height by 1 if required.
 */
function generateHeight(int32Array, block, blockSize) {

  var listHeight = int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS];
  var height = randomHeight();

  if (blockSize - 1 < height + 1) {
    height = blockSize - 2;
  }

  if (height > listHeight) {
    var newHeight = listHeight + 1;

    int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS] = newHeight;
    int32Array[HEADER_OFFSET_IN_QUADS + NEXT_OFFSET_IN_QUADS + (newHeight - 1)] = HEADER_OFFSET_IN_QUADS;
    UPDATES[newHeight] = HEADER_OFFSET_IN_QUADS;
    int32Array[block + HEIGHT_OFFSET_IN_QUADS] = newHeight;
    return newHeight;
  } else {
    int32Array[block + HEIGHT_OFFSET_IN_QUADS] = height;
    return height;
  }
}

/**
 * Generate a random height for a new block.
 */
function randomHeight() {
  var height = 1;
  for (var r = Math.ceil(Math.random() * 2147483648); (r & 1) === 1 && height < MAX_HEIGHT; r >>= 1) {
    height++;
    Math.ceil(Math.random() * 2147483648);
  }
  return height;
}
}(malloc));

malloc.Allocator = malloc.default;