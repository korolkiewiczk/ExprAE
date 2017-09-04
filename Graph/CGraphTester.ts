/// <reference path="../Drawing/CWin.ts" />

module ExprAE.Graph {

    import keys = ExprAE.System.Keys;
    import sys = ExprAE.System.CSys;

    export class CGraphTester extends Drawing.CWin {

        posx = 0;
        posy = 0;

        pal: Uint32Array;

        change: boolean = true;

        constructor(width: number,
            height: number,
            buf: Uint32Array) {
            super(width, height, buf);

            this.pal=new Uint32Array(256);
            for (var i = 0; i < 256; i++) {
                var element = D.RGB32(i, i, i);
                this.pal[i] = element;
            }
        }

        KeyFunc(k: keys): void {
            if (k == keys.K_UP)
                this.posy -= 10;
            if (k == keys.K_DOWN)
                this.posy += 10;
            if (k == keys.K_RIGHT)
                this.posx += 10;
            if (k == keys.K_LEFT)
                this.posx -= 10;
            if (k == keys.K_PAGE_UP)
                this.posy -= 25;
            if (k == keys.K_PAGE_DOWN)
                this.posy += 25;
            if (k==keys.K_SPACE)
                this.change=!this.change;
        }

        Process(): void {
            this.Clear();
            var mk = sys.MouseKey();
            if (mk) {
                this.posx = sys.getMouseX();
                this.posy = sys.getMouseY();
            }

            for (var i = 0; i < 100; i++) {
                this.Line(this.posx-150, this.posy-150, this.posx + 0, this.posy + (-i * 2), D.RGB32(255, 0, 0));
            }
            var zbuf: Uint32Array=new Uint32Array(this.width*this.height);
            zbuf.fill(0xffffff);
            this.GTriangle_z(this.posx - 50, this.posy - 50, this.posx + 100, this.posy + 50, this.posx + 50, this.posy + 150, 0, 100, 255, this.pal, 10, zbuf);

            this.HLine(100, 100, 200, D.RGB32(255, 255, 255));
            this.VLine(100, 100, 200, D.RGB32(255, 255, 255));

            this.Bar(230, 230, 270, 250, D.RGB32(255, 0, 0));

            this.fontheight = 8;
            this.DrawText(500, 300, D.RGB32(255, 0, 0), "A");
            this.DrawText(10, 10, D.RGB32(250, 250, 250), "Hello world!!! (x=" + this.posx + ", y=" + this.posy + ")");
            this.fontheight = 16;
            this.DrawText(10, 30, D.RGB32(250, 250, 250), "Hello world!!! (x=" + this.posx + ", y=" + this.posy + ")");

            this.DrawText3X5(10, 50, D.RGB32(250, 250, 250), "Hello world!!! (x=" + this.posx + ", y=" + this.posy + ")");

            if (this.change)
                this.posy = (this.posy + 1) % this.height;
        }

        ChangeActiveState(state: number): void {
        }

    }
}