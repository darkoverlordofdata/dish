###
 * Run tests

###
Promise.all(['entity', 'pool'].map((x) -> 
  System.import(x))).then ([{entity}, {pool}]) ->

    describe 'Smoke Tests', ->
    
      it 'Pool', ->
        expect(pool).to.not.equal(null) 

      it 'Entity', ->
        expect(entity).to.not.equal(null) 

      it 'CreateEntity', ->
        entity = pool.createEntity()
        expect(pool.test(entity, 0)).to.equal(1)


  , (err) -> console.log err

