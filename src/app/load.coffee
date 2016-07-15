###
 * Run tests
 *
###
Promise.all(['asm', 'mt19937ar', 'mt19937'].map((x) -> 
  System.import(x))).then ([{asm}, {mt19937ar}, {mt19937}]) ->

    `const MAX = 10000`

    describe "mt19937 Mersenne Twister", ->

        it "asm calibration", () ->
            expect(asm.getTime()).to.not.equal(200)
            return

        it "malloc should not return null", () ->
            expect(asm.test_malloc(16)).to.not.equal(0)
            expect(asm.test_malloc(16)).to.not.equal(0)
            return
            
        it "asm.js results should match plain js", () ->

            for i in [0..MAX]
                r1 = mt19937ar.genrand_int32()
                r2 = mt19937.genrand_int32()
                if r1 isnt r2 then break
                expect(r1).to.equal(r2)

            return

        it "time plain js #{MAX} tries", () ->

            t1 = performance.now()
            for i in [0..MAX]
                mt19937ar.genrand_int32()
            
            t2 = performance.now()
            expect(t2-t1).to.not.equal(0)
            return

        it "time interop #{MAX} tries", () ->

            t1 = performance.now()
            for i in [0..MAX]
                mt19937.genrand_int32()
            
            t2 = performance.now()
            expect(t2-t1).to.not.equal(0)
            return

        it "time asmjs asm only #{MAX} tries", () ->

            t1 = performance.now()
            mt19937.test()
            t2 = performance.now()
            expect(t2-t1).to.not.equal(0)
            return

  , (err) -> console.log err


