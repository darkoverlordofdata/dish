// Generated by CoffeeScript 1.10.0

/*
## Foreign function interface
 */
var Ffi, HEAP, HEAP_SIZE, allocator;

HEAP_SIZE = 0x40000;

Ffi = (function() {
  function Ffi() {}

  Ffi.now = function() {
    return performance.now();
  };


  /*
   * malloc
   *
   * @param nBytes number of bytes required
   * @returns starting offset in the heap
   */

  Ffi.malloc = function(nBytes) {
    var offset;
    if (typeof malloc !== "undefined" && malloc !== null) {
      return allocator.alloc(nBytes);
    } else {

      /*
      * Fallback:
      * this is a naive implementation of malloc. 
      * memory is only allocated, never freed.
       */
      offset = HEAP[0];
      HEAP[0] = offset + nBytes;
      return offset;
    }
  };

  Ffi.free = function(addr) {
    if (typeof malloc !== "undefined" && malloc !== null) {
      return allocator.free(addr);
    }
  };

  return Ffi;

})();

export default Ffi;

export const buffer = new ArrayBuffer(HEAP_SIZE);

export const foreign = Ffi;

export const bufferMax = HEAP_SIZE;

if (typeof malloc !== "undefined" && malloc !== null) {
  allocator = new malloc.Allocator(buffer);
} else {
  HEAP = new Int32Array(buffer);
  HEAP[0] = 16;
}
