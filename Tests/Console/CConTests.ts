/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../Console/CCon.ts" />
/// <reference path="../../System/Keys.ts" />

module ExprAE.Tests {
    import Ptr=ExprAE.Expressions.POINTER;

    describe("CCon", () => {

        describe("Edit (simple string)", () => {
            it("should set valid edit line while editing", () => {
                var console = new Console.CCon(640, 480, null, new Ptr(null, () => { }), null);

                console.Edit('E');
                console.Edit('X');
                console.Edit('P');
                console.Edit('R');

                expect(console["edit"][0]).toBe("EXPR");
            });
        });

        describe("Edit (simple string with bspace and delete)", () => {
            it("should set valid edit line while editing", () => {
                var console = new Console.CCon(640, 480, null, new Ptr(null, () => { }), null);

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
                var test = 0;
                var console = new Console.CCon(640, 480, null, new Ptr(null, (th, x) => { test = 1; return x + "OK" }), null);

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

        describe("Edit (with enter and 2 lines)", () => {
            it("should set valid edit line while editing and invoke ref func", () => {
                var test = 0;
                var console = new Console.CCon(640, 480, null, new Ptr(null, (th, x) => { test = 1; return x + "OK" }), null);

                console.Edit('E');
                console.Edit('X');
                console.Edit('P');
                console.Edit('R');
                console.Edit('\n');

                console.Edit('a');
                console.Edit('X');
                console.Edit('6');
                console.Edit('2');
                console.Edit('\n');

                expect(console["edit"][0]).toBe("EXPR");
                expect(console["lines"][0]).toBe("EXPROK");
                expect(console["edit"][1]).toBe("aX62");
                expect(console["lines"][1]).toBe("aX62OK");

                expect(test).toBe(1);
            });
        });

        describe("KeyFunc (with changing cursor pos and enter)", () => {
            it("should set valid edit line while editing and invoke ref func", () => {
                var test = 0;
                var console = new Console.CCon(640, 480, null, new Ptr(null, (th, x) => { test = 1; return x + "OK" }), null);

                console.KeyFunc(System.Keys.K_X);
                console.KeyFunc(System.Keys.K_X);
                console.KeyFunc(System.Keys.K_X);
                console.KeyFunc(System.Keys.K_X);
                console.KeyFunc(System.Keys.K_LEFT);
                console.KeyFunc(System.Keys.K_LEFT);
                console.KeyFunc(System.Keys.K_LEFT);
                console.KeyFunc(System.Keys.K_DELETE);
                console.KeyFunc(System.Keys.K_DELETE);
                console.KeyFunc(System.Keys.K_DELETE);
                console.KeyFunc(System.Keys.K_LEFT);
                console.KeyFunc(System.Keys.K_E | 0xff00);
                console.KeyFunc(System.Keys.K_RIGHT);
                console.KeyFunc(System.Keys.K_RIGHT);
                console.KeyFunc(System.Keys.K_P);
                console.KeyFunc(System.Keys.K_R);
                console.KeyFunc(System.Keys.K_R);
                console.KeyFunc(System.Keys.K_R);
                console.KeyFunc(System.Keys.K_LEFT);
                console.KeyFunc(System.Keys.K_BACK_SPACE);
                console.KeyFunc(System.Keys.K_RIGHT);
                console.KeyFunc(System.Keys.K_BACK_SPACE);
                console.KeyFunc(System.Keys.K_ENTER);

                expect(console["edit"][0]).toBe("Expr");
                expect(console["lines"][0]).toBe("ExprOK");

                expect(test).toBe(1);
            });
        });
    });
}