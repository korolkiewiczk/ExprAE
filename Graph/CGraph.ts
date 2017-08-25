/// <reference path="../Drawing/CWin.ts" />
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
            for(var i=0; i<100; i++) {
                D.SetBuf32(this.buf, this.width, i, 10, D.RGB32(0, 0, 0));
                D.SetBuf32(this.buf, this.width, i, 20, D.RGB32(255, 0, 0));
                D.SetBuf32(this.buf, this.width, i, 30, D.RGB32(0, 255, 0));
                D.SetBuf32(this.buf, this.width, i, 40, D.RGB32(0, 0, 255));
            }
        }

        Change(w: number, h: number, b: Uint32Array): void;
        Change(b: Uint32Array): void;
        Change(w: any, h?: any, b?: any) {
            this.buf=b;
        }
        ChangeActiveState(state: number): void {
        }

    }
}