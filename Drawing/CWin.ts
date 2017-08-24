module ExprAE.Drawing {
    export abstract class CWin {

        constructor(protected width: number,
                    protected height: number,
                    protected buf: Uint32Array) {
            
        }

        GetBuf(): Uint32Array {
            return this.buf;
        }
        abstract KeyFunc(k: System.Keys): void;
        abstract Process(): void;
        abstract Change(w: number,h: number,b: Uint32Array): void;
        abstract Change(b: Uint32Array): void;
        abstract ChangeActiveState(state: number): void;
    }
}