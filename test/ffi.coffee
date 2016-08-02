###
## Foreign function interface 
###

HEAP_SIZE = 0x40000

class Ffi

    @EntityIsNotEnabledException:() ->
        throw new Error('EntityIsNotEnabledException')
    @EntityAlreadyHasComponentException:(index) ->
        throw new Error("EntityAlreadyHasComponentException - #{index}")


    @now: -> performance.now()
    ###
     * malloc
     *
     * @param nBytes number of bytes required
     * @returns starting offset in the heap
    ###
    @malloc:(nBytes) -> 
        if malloc?
            allocator.alloc(nBytes)
        else
            ###
            * Fallback:
            * this is a naive implementation of malloc. 
            * memory is only allocated, never freed.
            ###
            offset = HEAP[0]
            HEAP[0] = offset+nBytes
            offset

    @free:(addr) ->
        if malloc? then allocator.free(addr)

`export default Ffi`  
`export const buffer = new ArrayBuffer(HEAP_SIZE)`
`export const foreign = Ffi`  
`export const bufferMax = HEAP_SIZE`

if malloc?
    allocator = new malloc.Allocator(buffer) 
else
    HEAP = new Int32Array(buffer)
    HEAP[0] = 16 # allocate header
