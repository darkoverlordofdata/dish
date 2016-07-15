

Promise.all(['asm', 'mt19937ar', 'mt19937'].map((x) -> 
    System.import(x))).then ([{asm}, {mt19937ar}, {mt19937}]) ->

        MAX = 10000
        testResults = [[0,0,0,0,0],[0,0,0,0,0]]

        QUnit.test "asm calibration", (assert) ->
            elapsed = asm.getTime()
            assert.ok elapsed < 200, "elapsed < 200"

        QUnit.test "malloc", (assert) ->
            m1 = asm.test_malloc(16)
            m2 = asm.test_malloc(16)

            assert.ok m1 isnt 0, "passed #{m1}"
            assert.ok m2 isnt 0, "passed #{m2}"


        QUnit.test "mt19937 Same Results?", (assert) ->
            testResults[0][0] = mt19937ar.genrand_int32()
            testResults[0][1] = mt19937ar.genrand_int32()
            testResults[0][2] = mt19937ar.genrand_int32()
            testResults[0][3] = mt19937ar.genrand_int32()
            testResults[0][4] = mt19937ar.genrand_int32()

            testResults[1][0] = mt19937.genrand_int32()
            testResults[1][1] = mt19937.genrand_int32()
            testResults[1][2] = mt19937.genrand_int32()
            testResults[1][3] = mt19937.genrand_int32()
            testResults[1][4] = mt19937.genrand_int32()
            
            assert.ok testResults[0][0] is testResults[1][0], "[0] Passed!" 
            assert.ok testResults[0][1] is testResults[1][1], "[1] Passed!" 
            assert.ok testResults[0][2] is testResults[1][2], "[2] Passed!" 
            assert.ok testResults[0][3] is testResults[1][3], "[3] Passed!" 
            assert.ok testResults[0][4] is testResults[1][4], "[4] Passed!" 
            return

        QUnit.test "mt19937.asmjs interop #{MAX} tries", (assert) ->

            t1 = performance.now()
            for i in [0..MAX]
                mt19937.genrand_int32()
            
            t2 = performance.now()
            console.log("mt19937.asmjs interop "+(t2-t1))
            assert.ok t2 > t1, "passed"   
            return 

        QUnit.test "mt19937.asmjs asm only #{MAX} tries", (assert) ->

            t1 = performance.now()
            mt19937.test()
            t2 = performance.now()
            console.log("mt19937.asmjs asm only "+(t2-t1))    
            assert.ok t2 > t1, "passed"
            return    

    , (err) -> console.log err


