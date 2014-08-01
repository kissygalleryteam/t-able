KISSY.add(function (S, Node,Demo) {
    var $ = Node.all;
    describe('t-able', function () {
        it('Instantiation of components',function(){
            var demo = new Demo();
            expect(S.isObject(demo)).toBe(true);
        })
    });

},{requires:['node','gallery/t-able/0.1/']});