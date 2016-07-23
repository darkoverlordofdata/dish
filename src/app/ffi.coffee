###
## Foreign function interface 
###

HEAP_SIZE = 0x40000

class Ffi
    
    @now: -> performance.now()
    ###
     * malloc
     *
     * this is a naive implementation of malloc. 
     * memory is only allocated, never returned.
     *
     * @param nBytes number of bytes required
     * @returns starting offset in the heap
    ###
    @malloc:(nBytes) -> 
        offset = HEAP[0]
        HEAP[0] = offset+nBytes
        offset

`export default Ffi`  
`export const buffer = new ArrayBuffer(HEAP_SIZE)`
`export const bufferMax = HEAP_SIZE`
HEAP = new Int32Array(buffer);
HEAP[0] = 16 # allocate header
