module ExprAE.Expressions {
    interface callBack { (...args: any[]): any }

    export class OP {
        constructor(
            public opname: string, 
            public fname: string, 
            public ref: callBack,
            public  p: number) {

            }
    }
}