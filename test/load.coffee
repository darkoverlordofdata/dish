###
 * Run tests

###


Promise.all(['entity', 'pool', 'mt19937', 'test-twister'].map((x) -> 
  System.import(x))).then ([{entity}, {pool}, {mt19937}, {MersenneTwister}]) ->
# Promise.all(['entity', 'pool'].map((x) -> 
#   System.import(x))).then ([{entity}, {pool}]) ->

    describe 'MT19937', ->

      it 'check', ->
        expect(MersenneTwister.genrand_int32()).to.equal(20535309)
        expect(mt19937.genrand_int32()).to.equal(20535309)
        expect(mt19937ar.genrand_int32()).to.equal(20535309)

      it 'time js', ->
        for i in [0..1000]
          for j in [0..32767]
            z = mt19937ar.genrand_int32()

        expect(0).to.equal(0)

      it 'time dish', ->
        mt19937.test(1000, 32767)
        # for i in [0..1000]
        #   for j in [0..32767]
        #     z = mt19937.genrand_int32()

        expect(0).to.equal(0)

  , (err) -> console.log err

