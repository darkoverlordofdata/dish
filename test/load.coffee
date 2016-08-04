###
 * Run tests

###


fib = (x) ->
  if x<2 
    1
  else
    fib(x - 1) + fib(x - 2)

fibz = (n) ->
  x = 0
  y = 1
  z = 1
  for i in [0..n]
    x = y
    y = z
    z = x+y
  x


fiby = (x) ->
  if (x < 2)
    return 1
  else
    a = 1
    v = x
    while 1
      v1 = v-1
      v2 = fiby(v1)
      v3 = v-2
      v4 = v2 + a
      v5 = v3 < 2
      if (v5)
        return v4
      else
        a = v4
        v = v3





Promise.all(['unit'].map((x) -> 
  System.import(x))).then ([{unit}]) ->

    describe 'Smoke Tests', ->
    
      it 'Hello', ->
        expect(0).to.equal(0) 

      it 'Fib1', ->
        # expect(fib(20)).to.equal(10946) 
        expect(fib(45)).to.equal(1836311903) 

      it 'Fib2', ->
        # expect(fiby(20)).to.equal(10946) 
        expect(fibz(45)).to.equal(1836311903) 



  , (err) -> console.log err

