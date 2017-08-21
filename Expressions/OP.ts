module ExprAE.Expressions {
    export class OP {
        constructor(
            public opname: string, 
            public fname: string, 
            public ref: ICallback,
            public  p: number) {

            }
    }
}