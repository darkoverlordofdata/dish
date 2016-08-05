// Generated by CoffeeScript 1.10.0

/*
 * Run tests
 */
Promise.all(['entity', 'pool', 'mt19937', 'test-twister'].map(function(x) {
  return System["import"](x);
})).then(function(arg) {
  var MersenneTwister, entity, mt19937, pool, ref, ref1, ref2, ref3;
  (ref = arg[0], entity = ref.entity), (ref1 = arg[1], pool = ref1.pool), (ref2 = arg[2], mt19937 = ref2.mt19937), (ref3 = arg[3], MersenneTwister = ref3.MersenneTwister);
  return describe('MT19937', function() {
    it('check', function() {
      expect(MersenneTwister.genrand_int32()).to.equal(20535309);
      expect(mt19937.genrand_int32()).to.equal(20535309);
      return expect(mt19937ar.genrand_int32()).to.equal(20535309);
    });
    it('time js', function() {
      var i, j, k, l, z;
      for (i = k = 0; k <= 1000; i = ++k) {
        for (j = l = 0; l <= 32767; j = ++l) {
          z = mt19937ar.genrand_int32();
        }
      }
      return expect(0).to.equal(0);
    });
    return it('time dish', function() {
      mt19937.test(1000, 32767);
      return expect(0).to.equal(0);
    });
  });
}, function(err) {
  return console.log(err);
});
