/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../Expressions/CLib.ts" />
module ExprAE.Tests {
    describe("CLib", () => {
        describe("AddElement", () => {
            it("should add new element to library", () => {
                var library = new Expressions.CLib();
                library.addElement(new Expressions.ELEMENT("Te", () => { }, 0, 2, 2, 0));
                expect(library["root"].l[library["index"]('T')].n).toBe(null);
                expect(library["root"].l[library["index"]('T')].l[library["index"]('e')].n.parattr).toBe(2);
            });
        });

        describe("NListFromTxt", () => {
            it("should return valid list of elements", () => {
                var library = new Expressions.CLib();
                library.addElement(new Expressions.ELEMENT("Test", () => { }, 0, 2, 2, 0));
                library.addElement(new Expressions.ELEMENT("Tester", () => { }, 0, 2, 2, 0));
                library.addElement(new Expressions.ELEMENT("Sin", () => { }, 0, 2, 2, 0));
                library.addElement(new Expressions.ELEMENT("Cos", () => { }, 0, 2, 2, 0));
                library.addElement(new Expressions.ELEMENT("X", () => { }, 0, 2, 2, 0));
                library.addElement(new Expressions.ELEMENT("y", () => { }, 0, 2, 2, 0));

                /*var result=library.NListFromTxt("Tes",'|');
                expect(result.w).toBe(2);
                expect(result.ret).toBe("TEST|TESTER");*/ //todo
            });
        });
    });
}