module ExprAE.Graph {
    export class CGraph extends Drawing.CWin {

        constructor(width: number,
            height: number,
            buf: Uint32Array) {
            super(width, height, buf);
        }

        KeyFunc(k: System.Keys): void {

        }
        Process(): void {
            D.SetBuf32(this.buf, this.width, 0, 0, D.RGB32(0, 255, 255));
            D.SetBuf32(this.buf, this.width, 1, 1, D.RGB32(255, 0, 255));
            D.SetBuf32(this.buf, this.width, 2, 2, D.RGB32(255, 255, 0));
        }

        Change(w: number, h: number, b: Uint32Array): void;
        Change(b: Uint32Array): void;
        Change(w: any, h?: any, b?: any) {
        }
        ChangeActiveState(state: number): void {
        }

    }
}