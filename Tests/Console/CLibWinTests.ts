/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../Expressions/CLib.ts" />
/// <reference path="../../Console/CLibWin.ts" />
/// <reference path="../../System/Keys.ts" />

module ExprAE.Tests {

    describe("CLibWin", () => {
        describe("Search for simple string", () => {
            it("should set valid edit line while editing", () => {
                var library = new Expressions.CLib();
                library.addElement(new Expressions.ELEMENT("Test", () => { }, 0, 2, 2, 0));
                library.addElement(new Expressions.ELEMENT("Tester", () => { }, 0, 2, 2, 0));
                library.addElement(new Expressions.ELEMENT("Sin", () => { }, 0, 2, 2, 0));
                library.addElement(new Expressions.ELEMENT("Cos", () => { }, 0, 2, 2, 0));
                library.addElement(new Expressions.ELEMENT("X", () => { }, 0, 2, 2, 0));
                library.addElement(new Expressions.ELEMENT("y", () => { }, 0, 2, 2, 0));

                var libwin = new Console.CLibWin(640, 480, null, 10,10,400,400, library);

                libwin.KeyFunc(System.Keys.K_T);
                libwin.KeyFunc(System.Keys.K_E);

                expect(libwin["tbuf"]).toBe("TESTER\nTEST\n");
            });
        });
    });
}