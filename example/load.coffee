###
 * Run tests
###
Promise.all(['Entity', 'Position', 'Pool'].map((x) -> 
  System.import(x))).then ([{Entity}, {Position}, {Pool}]) ->

    describe 'Entitas / asm.js', ->
      console.log('hello')

      # it 'Create entity', ->
      #   MAX = 4

      #   console.log(MAX)

      #   pool.initialize(10)
      #   e1 = pool.createEntity()
      #   expect(Entity.getId(e1)).to.equal(1)
      #   Entity.setEnabled(e1, 0)
      #   expect(Entity.getEnabled(e1)).to.equal(0)

      #   for i in [0..MAX]
      #     e2 = pool.createEntity()
      #   expect(Entity.getId(e2)).to.equal(MAX+2)

      # it 'Create Position', ->

      #   pool.initialize(10)
      #   pos = pool.createPos(95.0, 96.0)
      #   #fm = pool.createPos(99.9, 107.7)
      #   console.log('Pos',Position.getX(pos),',', Position.getY(pos))
      #   expect(Position.getX(pos)).to.equal(95)
      #   expect(Position.getY(pos)).to.equal(96)

      # it 'Create Entity with Position', ->

      #   pool.initialize(10)
      #   e3 = pool.createEntity()

      #   pos = pool.createPos(95.0, 96.0)
      #   pool.addComponent(e3, 1, pos)
      #   poz = Entity.getComponent(e3, 1)

      #   # fm = pool.createPos(99.9, 107.7)
      #   # pool.addComponent(e3, 1, fm)
        
      #   expect(Position.getX(poz)).to.equal(95)
      #   expect(Position.getY(poz)).to.equal(96)

      # it 'Raise EntityAlreadyHasComponentException', ->

      #   pool.initialize(10)
      #   e4 = pool.createEntity()

      #   pos = pool.createPos(95.0, 96.0)
      #   pool.addComponent(e4, 2, pos)
      #   #poz = Entity.getComponent(e4, 2)

      #   fm = pool.createPos(99.9, 107.7)
      #   console.log(e4, pos, fm)

      #   try 
      #     pool.addComponent(e4, 2, fm)
      #   catch ex
      #     expect(ex.message).to.equal("EntityAlreadyHasComponentException - 2")
        
      #   #expect('').to.not.equal("EntityAlreadyHasComponentException - 2")
        

      

  , (err) -> console.log err

