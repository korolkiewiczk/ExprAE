/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../Console/CCon.ts" />

module ExprAE.Tests {
    describe("CCon", () => {

        describe("Edit (simple string)", () => {
            it("should set valid edit line while editing", () => {
                var console = new Console.CCon(640,480,null, ()=>{}, null);

                console.Edit('E');
                console.Edit('X');
                console.Edit('P');
                console.Edit('R');

                expect(console["edit"][0]).toBe("EXPR");
            });
        });

        describe("Edit (simple string with bspace and delete)", () => {
            it("should set valid edit line while editing", () => {
                var console = new Console.CCon(640,480,null, ()=>{}, null);

                console.Edit('E');
                console.Edit('X');
                console.Edit('P');
                console.Edit('R');
                
                console.Edit(String.fromCharCode(127));
                console.Edit(String.fromCharCode(8));

                expect(console["edit"][0]).toBe("EXP");
            });
        });

        describe("Edit (with enter)", () => {
            it("should set valid edit line while editing and invoke ref func", () => {
                var test=0;
                var console = new Console.CCon(640,480,null, (x)=>{test=1; return x+"OK"}, null);

                console.Edit('E');
                console.Edit('X');
                console.Edit('P');
                console.Edit('R');
                console.Edit('\n');

                expect(console["edit"][0]).toBe("EXPR");
                expect(console["lines"][0]).toBe("EXPROK");
                expect(test).toBe(1);
            });
        });
    });
}