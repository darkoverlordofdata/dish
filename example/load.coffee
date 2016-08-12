###
 * Run tests
###
Promise.all(['Entity', 'pool'].map((x) -> 
  System.import(x))).then ([{Entity}, {pool}]) ->

    describe 'Entitas / asm.js', ->
      console.log('hello')

      it 'Create entity', ->
        MAX = 400

        console.log(MAX)

        pool.initialize(10)
        e1 = pool.createEntity()
        expect(Entity.getId(e1)).to.equal(1)
        Entity.setEnabled(e1, 0)
        expect(Entity.getEnabled(e1)).to.equal(0)

        for i in [0..MAX]
          e2 = pool.createEntity()
        expect(Entity.getId(e2)).to.equal(MAX+2)


  , (err) -> console.log err

