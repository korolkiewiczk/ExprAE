module ExprAE {
    export class Main {
        main(): void {
            System.CSys.Init();
            var library=new Expressions.CLib();
            var stdlib=new Expressions.Stdlib();
            stdlib.init(library);

            var expr=new Expressions.CExpr(library);
        }
    }
}