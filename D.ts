module ExprAE {
    export class D {
        static RGB32(r: number, g: number, b: number, a: number = 255): number {
            return (a & 255) << 24 | (b & 255) << 16 | (g & 255) << 8 | r & 255;
        }

        static SetBuf32(buf: Uint32Array, pitch: number, x: number, y: number, c: number) {
            buf[y * pitch + x] = c;
        }

        static IS_UD(a: number): boolean {
            return a==undefined;
        }

        static IS_INFM(a: number): boolean {
            return a==Number.NEGATIVE_INFINITY;
        }

        static IS_INFP(a: number): boolean {
            return a==Number.POSITIVE_INFINITY;
        }
    }
}