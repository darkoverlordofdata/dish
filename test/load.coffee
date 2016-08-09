###
 * Run tests
###
Promise.all(['entity', 'pool', 'test-twister'].map((x) -> 
  System.import(x))).then ([{Entity}, {pool}, {MersenneTwister}]) ->

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
        MAX = 400

        pool.initialize(10)
        e1 = pool.createEntity()
        expect(Entity.getId(e1)).to.equal(1)
        Entity.setEnabled(e1, 0)
        expect(Entity.getEnabled(e1)).to.equal(0)

        for i in [0..MAX]
          e2 = pool.createEntity()
        expect(Entity.getId(e2)).to.equal(MAX+2)


  , (err) -> console.log err

