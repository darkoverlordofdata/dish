###
 * Run tests
 *
###
Promise.all(['test1'].map((x) -> 
  System.import(x))).then ([{test1}]) ->

    describe 'Basic Tests', ->
    

      it 'Factorial', ->
        expect(test1.factorial(10)).to.equal(45)
        return

      it 'Alloc', ->
        expect(test1.alloc(10)).to.equal(4)
        expect(test1.alloc(10)).to.equal(14)

      it 'Index', ->
        expect(test1.index(2)).to.equal(44)


  , (err) -> console.log err

