###
 * Run tests
 *
###
Promise.all(['test1', 'test2', 'test-twister', 'mt19937'].map((x) -> 
  System.import(x))).then ([{test1}, {test2}, {MersenneTwister}, {mt19937}]) ->
  # Promise.all(['test1', 'test2'].map((x) -> 
  #   System.import(x))).then ([{test1}, {test2}]) ->

    describe 'Basic Tests', ->
    
      it 'Factorial', ->
        expect(test1.factorial(10)).to.equal(45)
        return

      it 'Alloc', ->
        # initial heap ptr is 16 >> 2
        expect(test1.alloc(10)).to.equal(if malloc? then 68 else 4)
        expect(test1.alloc(10)).to.equal(if malloc? then 80 else 14)
        return

      it 'List', ->
        expect(test1.values()).to.equal(if malloc? then 92 else 24)
        expect(test2.index((if malloc? then 92 else 24), 2)).to.equal(44)
        return

      it 'Random', ->
        # compare to testResults from mt18827ar.js
        expect(mt19937.genrand_int32()).to.equal(testResults[0])
        expect(mt19937.genrand_int32()).to.equal(testResults[1])
        expect(mt19937.genrand_int32()).to.equal(testResults[2])
        expect(mt19937.genrand_int32()).to.equal(testResults[3])
        expect(mt19937.genrand_int32()).to.equal(testResults[4])
        return

      it 'And', ->
        # expect(test2.test().to.equal(20))
        expect(test2.and(42)).to.equal(42)

      it 'MersenneTwister', ->
        expect(MersenneTwister.genrand_int32()).to.equal(testResults[0]) #testResults[0])

  , (err) -> console.log err

