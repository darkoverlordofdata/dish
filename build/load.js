// Generated by CoffeeScript 1.10.0

/*
 * Run tests
 */
Promise.all(['Entity', 'pool'].map(function(x) {
  return System["import"](x);
})).then(function(arg) {
  var Entity, pool, ref, ref1;
  (ref = arg[0], Entity = ref.Entity), (ref1 = arg[1], pool = ref1.pool);
  return describe('Entitas / asm.js', function() {
    console.log('hello');
    return it('Create entity', function() {
      var MAX, e1, e2, i, j, ref2;
      MAX = 400;
      console.log(MAX);
      pool.initialize(10);
      e1 = pool.createEntity();
      expect(Entity.getId(e1)).to.equal(1);
      Entity.setEnabled(e1, 0);
      expect(Entity.getEnabled(e1)).to.equal(0);
      for (i = j = 0, ref2 = MAX; 0 <= ref2 ? j <= ref2 : j >= ref2; i = 0 <= ref2 ? ++j : --j) {
        e2 = pool.createEntity();
      }
      return expect(Entity.getId(e2)).to.equal(MAX + 2);
    });
  });
}, function(err) {
  return console.log(err);
});
