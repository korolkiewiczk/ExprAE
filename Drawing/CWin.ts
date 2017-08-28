module ExprAE.Drawing {
    export class CWin {

        static FIXED_SHIFT = 10;

        protected fontwidth = 8;
        protected fontheight = 8;

        constructor(protected width: number,
            protected height: number,
            protected buf: Uint32Array) {
        }

        GetBuf(): Uint32Array {
            return this.buf;
        }
        KeyFunc(k: System.Keys): void { }
        Process(): void { }
        Change(b: Uint32Array, w?: number, h?: number): void {
            if (w)
                this.width = w;
            if (h)
                this.height = h;
            this.buf = b;
        }

        ChangeActiveState(state: number): void { }

        ChangeFontSize(w: number, h: number) {
            this.fontwidth = w;
            this.fontheight = h;
        }

        PutPixel(x: number, y: number, c: number) {
            if ((x < 0) || (y < 0) || (x >= this.width) || (y >= this.height)) return;
            D.SetBuf32(this.buf, this.width, x, y, c);
        }

        Line(x1: number, y1: number, x2: number, y2: number, col: number) {
            //przytnij linie
            if ((((x1 < 0) && (x2 < 0)) || ((y1 < 0) && (y2 < 0))) ||
                (((x1 >= this.width) && (x2 >= this.width)) || ((y1 >= this.height) && (y2 >= this.height)))) return;

            if (x1 == x2) {
                this.VLine(x1, y1, y2, col);
                return;
            }
            else
                if (y1 == y2) {
                    this.HLine(x1, y1, x2, col);
                    return;
                }

            if ((x1 < 0) || (x2 < 0) || (y1 < 0) || (y2 < 0) ||
                (x1 >= this.width) || (x2 >= this.width) || (y1 >= this.height) || (y2 >= this.height)) {
                var a: number, b: number;
                a = ((y2 - y1) << CWin.FIXED_SHIFT) / (x1 - x2);
                b = -(y1 << CWin.FIXED_SHIFT) - a * x1;
                var left: number, right: number, top: number, bottom: number;
                left = b >> CWin.FIXED_SHIFT;
                right = (a * (this.width - 1) + b) >> CWin.FIXED_SHIFT;
                if (a == 0) a = 1;
                top = (-b / a);
                bottom = ((-((this.height - 1) << CWin.FIXED_SHIFT) - b) / a);
                var ok = 0;

                if ((left <= 0) && (left >= -this.height + 1)) {
                    if (x1 < 0) {
                        x1 = 0;
                        y1 = -left;
                    }
                    else
                        if (x2 < 0) {
                            x2 = 0;
                            y2 = -left;
                        }
                    ok = 1;
                }
                if ((right <= 0) && (right >= -this.height + 1)) {
                    if (x1 >= this.width) {
                        x1 = this.width - 1;
                        y1 = -right;
                    }
                    else
                        if (x2 >= this.width) {
                            x2 = this.width - 1;
                            y2 = -right;
                        }
                    ok = 1;
                }
                if ((top >= 0) && (top < this.width)) {
                    if (y1 < 0) {
                        x1 = top;
                        y1 = 0;
                    }
                    else
                        if (y2 < 0) {
                            x2 = top;
                            y2 = 0;
                        }
                    ok = 1;
                }
                if ((bottom >= 0) && (bottom < this.width)) {
                    if (y1 >= this.height) {
                        x1 = bottom;
                        y1 = this.height - 1;
                    }
                    else
                        if (y2 >= this.height) {
                            x2 = bottom;
                            y2 = this.height - 1;
                        }
                    ok = 1;
                }
                if (ok == 0) return;
                if ((x1 < 0) || (x2 < 0) || (y1 < 0) || (y2 < 0) ||
                    (x1 >= this.width) || (x2 >= this.width) || (y1 >= this.height) || (y2 >= this.height)) return;
            }

            var sx = x2 - x1, sy = y2 - y1;
            var dx1: number, dy1: number, dx2: number, dy2: number;
            if (sx > 0) dx1 = 1; else if (sx < 0) dx1 = -1; else dx1 = 0;
            if (sy > 0) dy1 = 1; else if (sy < 0) dy1 = -1; else dy1 = 0;
            a = Math.abs(sx);
            b = Math.abs(sy);
            if (a > b) {
                dx2 = dx1; dy2 = 0;
            }
            else {
                dx2 = 0; dy2 = dy1;
                var pom = a; a = b; b = pom;
            }
            var s = a / 2;
            var dwsk1 = dx1 + dy1 * this.width, dwsk2 = dx2 + dy2 * this.width;
            var wsk = (y1 * this.width + x1);

            for (var i = 0; i <= a; i++) {
                this.buf[wsk] = col;
                s += b;
                if (s >= a) {
                    s -= a;
                    wsk += dwsk1;
                }
                else {
                    wsk += dwsk2;
                }
            }
        }

        HLine(x1: number, y: number, x2: number, col: number) {
            if ((y < 0) || (y >= this.height)) return;
            if (x1 > x2) { var pom = x1; x1 = x2; x2 = pom; }
            if (x1 < 0) x1 = 0;
            if (x2 >= this.width) x2 = this.width - 1;
            if (x2 - x1 + 1 <= 0) return;
            var pos0=x1 + y * this.width;
            this.buf.fill(col, pos0, pos0 + x2 - x1 + 1);
        }

        VLine(x: number, y1: number, y2: number, col: number) {
            if ((x < 0) || (x >= this.width)) return;
            if (y1 > y2) { var pom = y1; y1 = y2; y2 = pom; }
            if (y1 < 0) y1 = 0;
            if (y2 >= this.height) y2 = this.height - 1;
            var i = y2 - y1 + 1;
            if (i <= 0) return;
            var bf = (x + y1 * this.width);
            while (i--) {
                this.buf[bf] = col;
                bf += this.width;
            }
        }
    }
}