

System.import('asm').then (module) ->

    console.log 'asm loaded'
    elapsed = module.asm.getTime()
    console.log "asm.getTime = #{elapsed}"
    console.log "Compile", if elapsed < 200 then "Ok" else "ERROR"
    console.log module.asm.test_malloc(16)
    console.log module.asm.test_malloc(16)

, (err) -> console.log err

System.import('mt19937').then (module) ->

    console.log 'mt19937 loaded'
    console.log module.mt19937.genrand_int32()
    console.log module.mt19937.genrand_int32()
    console.log module.mt19937.genrand_int32()
    console.log module.mt19937.genrand_int32()

, (err) -> console.log err

