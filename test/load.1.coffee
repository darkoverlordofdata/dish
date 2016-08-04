###
 * Run tests

###




Promise.all(['entity', 'pool', 'mt19937'].map((x) -> 
  System.import(x))).then ([{entity}, {pool}, {mt19937}]) ->

    describe 'Smoke Tests', ->
    
      it 'Pool', ->
        expect(pool).to.not.equal(null) 

      it 'Entity', ->
        expect(entity).to.not.equal(null) 


      it 'Initialize', ->
        expect(pool.initialize(10)).to.equal(0)

      it 'Create entity', ->
        entity = []
        for i in [0..100]
          entity.push(pool.createEntity())
        expect(pool.test(entity[51], 0)).to.equal(52)

      it 'Repeat JS', ->
        for i in [0..32767]
          for j in [0..32767]
            k = j&32>>2;
        expect(k).to.equal(8)

      it 'Repeat Dish', ->
        expect(pool.testInc()).to.equal(8)

    describe 'MT19937', ->

      it 'check', ->
        expect(mt19937ar.genrand_int32()).to.equal(20535309)

      it 'time js', ->
        for i in [0..1000]
          for j in [0..32767]
            z = mt19937ar.genrand_int32()

        expect(0).to.equal(0)

      it 'time dish', ->
        for i in [0..1000]
          for j in [0..32767]
            z = mt19937.genrand_int32()

        expect(0).to.equal(0)

  , (err) -> console.log err

