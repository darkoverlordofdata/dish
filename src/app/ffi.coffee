###
## Foreign function interface 
###
class Ffi
    
    @now: -> performance.now()
    @malloc:(n) -> 
        m = HEAP[0]
        HEAP[0] = m+n
        m

`export default Ffi`  
`export const buffer = new ArrayBuffer(0x40000)`
HEAP = new Int32Array(buffer);
HEAP[0] = 16
