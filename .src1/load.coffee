System.import('asm').then (module) ->

    console.log 'asm loaded'
    console.log "asm.getTime = #{module.asm.getTime()}"

, (err) -> 
    
    console.log err

