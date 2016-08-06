###
 * Run tests
###
Promise.all(['entity', 'pool', 'test-twister'].map((x) -> 
  System.import(x))).then ([{entity}, {pool}, {MersenneTwister}]) ->

    describe 'MT19937', ->

      it 'Same result', ->
        for i in [0..4]
          expect(MersenneTwister.genrand_int32()).to.equal(mt19937ar.genrand_int32())

      it 'Speed js', ->
        for i in [0..1000]
          for j in [0..32767]
            z = mt19937ar.genrand_int32()

        expect(0).to.equal(0)

      it 'Speed dish', ->
        MersenneTwister.test(1000, 32767)

        expect(0).to.equal(0)

      it 'Create entity', ->
        pool.initialize(10)
        e = pool.createEntity()
        expect(entity.getId(e)).to.equal(1)

  , (err) -> console.log err

