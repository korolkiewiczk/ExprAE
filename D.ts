module ExprAE {
    export class D {
        static RGB32(r = 0, g = 0, b = 0): number {
            return (((r) & 255) << 16) | (((g) & 255) << 8) | ((b) & 255);
        }

        static SetBuf32(buf: any[], pitch = 0, x = 0, y = 0, c = 0) {
            buf[y * pitch + (x << 2)] = c;
        }
    }
}