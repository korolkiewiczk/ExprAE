/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../Expressions/CLib.ts" />
module ExprAE.Tests {
    describe("CLib", () => {
        describe("AddElement", () => {
            it("should add new element to library", () => {
                var library=new Expressions.CLib();
                library.addElement(new Expressions.ELEMENT("Te",()=>{},0,2,2,0));
                expect(library["root"].l[library["index"]('T')].n).toBe(null);
                expect(library["root"].l[library["index"]('T')].l[library["index"]('e')].n.parattr).toBe(2);
            });
        });
    });
}