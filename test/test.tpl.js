import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'

export const {{ name }} = (function(stdlib, foreign, heap) {
"use asm";

{% if float %}var fround = stdlib.Math.fround;{% endif %}
{% if heapi8 %}var HEAPI8 = new stdlib.Int8Array(heap);{% endif %}
{% if heapu8 %}var HEAPU8 = new stdlib.UInt8Array(heap);{% endif %}
{% if heapi16 %}var HEAPI16 = new stdlib.Int16Array(heap);{% endif %}
{% if heapu16 %}var HEAPU16 = new stdlib.Uint16Array(heap);{% endif %}
{% if heapi32 %}var HEAPI32 = new stdlib.Int32Array(heap);{% endif %}
{% if heapu32 %}var HEAPU32 = new stdlib.Uint32Array(heap);{% endif %}
{% if heapf32 %}var HEAPF32 = new stdlib.Float32Array(heap);{% endif %}
{% if heapf64 %}var HEAPF64 = new stdlib.Float32Array(heap);{% endif %}
{% if malloc %}var malloc = foreign.malloc;{% endif %}
{{ code }}    
return { {% for func in exports %}
    {{ func.key }}:{{ func.value }},{% endfor %} 
};
}(Stdlib, Ffi, buffer))
