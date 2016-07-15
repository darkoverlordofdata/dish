###
## Foreign function interface 
###
class Ffi
    
    @now: -> performance.now()
    ###
     * malloc
     *
     * @param nBytes number of bytes required
     * @returns starting offset in the heap
    ###
    @malloc:(nBytes) -> 
        offset = HEAP[0]
        HEAP[0] = offset+nBytes
        offset

`export default Ffi`  
`export const buffer = new ArrayBuffer(0x40000)`
HEAP = new Int32Array(buffer);
HEAP[0] = 16 # allocate header
