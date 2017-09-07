import ICB = ExprAE.Expressions.ICallback;

module ExprAE.System {
    export class CSys {

        static MAXWIN = 5;
        static MAXLIB = 8;
        static OPTMIXBUFLEN_SEC = 0.08;
        //static SOUND_MIXER_SECTIONS (iceil((float)sndbufsize*8.f/(float)SoundBPS/\
        //(float)SoundChannels/((float)SoundFreq*OPTMIXBUFLEN_SEC))-1)

        static RECORDINPUTSOUNDBUFLEN = 65536;
        static TITLETEXT = "ExprAE v. 0.1";

        static VAR_DWORD = 0;
        static VAR_FLOAT = 1;
        static VAR_BYTE = 2;
        static VAR_WORD = 3;
        static VAR_RGB = 4;
        static VAR_STR = 5;

        static CNormal=0;
        static CHighlighted=1;
        static CFaded=2;
        static CFavour=3;
        static CHelp=4;
        static CNum=5;
        static COp=6;
        static CTxt=7;
        static CPattern=8;
        
        static Color = new Array(
            D.RGB32(210, 210, 210),
            D.RGB32(230, 230, 230),
            D.RGB32(128, 128, 128),
            D.RGB32(240, 0, 0),
            D.RGB32(240, 240, 0),
            D.RGB32(128, 240, 240),
            D.RGB32(200, 200, 240),
            D.RGB32(255, 0, 0),
            D.RGB32(0, 0, 0));

        private static windows: Drawing.CWin[] = [];
        private static activewin: number = 0;
        private static varlib: Expressions.CLib;
        /*int CSys::DLibrariesC=0;
        char CSys::DLibrariesNames[MAXLIB][64];*/

        /*int CSys::VidModes[8][2]=
        {
            {320,240},   //F1
            {640,480},   //F2
            {800,600},   //F3
            {1024,768},  //F4
            {1280,1024}, //F5
            {320,200},   //F6
            {640,400},   //F7
            {1280,800},  //F8
        };
        int CSys::DLibraries[MAXLIB];
        int CSys::Windowed=1;
        void *CSys::RecBuf=0;
        int CSys::RecBufPos=0;
        FILE *CSys::logfile=(FILE*)-1;*/

        private static simulatedkeytab: number[] = [];
        private static keytab: number[] = [];

        private static mousekeystate: number[] = [];
        private static mouseX: number;
        private static mouseY: number;
        private static mouseWhellDelta: number;

        static DColor = 0;
        static PresentWait = 0;
        static ScrWidth = 640;
        static ScrHeight = 480;
        static ScrBpp = 32;
        static SoundOn = 0;
        static SoundFreq = 44100
        static SoundBPS = 16
        static SoundChannels = 2;
        static SoundMixerBufSize = 0;
        static SRand0 = 0;

        private static buf: Uint32Array;
        private static buf8: Uint8Array;
        private static imgData: ImageData;

        /*#ifdef MENU
        static Menu: CMenu;
        ::361
        #endif*/

        static cursor = 1;
        static SetCur() {
            CSys.cursor = 1 - CSys.cursor;
            //Cursor(c); todo document.getElementById('nocursor').style.cursor = 'none';
        }

        static Init(): any {
            var canvas = CSys.getDrawingCanvas();
            CSys.ScrWidth = canvas.width;
            CSys.ScrHeight = canvas.height;

            CSys.varlib = new Expressions.CLib();
            CSys.AddVar("scrwidth", CSys.__ScrWidth, CSys.VAR_DWORD);
            CSys.AddVar("scrheight", CSys.__ScrHeight, CSys.VAR_DWORD);
            CSys.AddVar("color", CSys.__Color, CSys.VAR_RGB);
            CSys.ExecCfg();
            CSys.DelVar("scrwidth");
            CSys.DelVar("scrheight");

            /*#ifdef MENU
                InitMenu();
            #endif*/

            CSys.VidMode(CSys.ScrWidth, CSys.ScrHeight);

            CSys.SRand0 = (new Date().getTime());

            CSys.initEvents();
        }

        private static initEvents() {
            document.onkeydown = function (event: KeyboardEvent) {
                event = event || window.event as KeyboardEvent;
                if(event.keyCode == Keys.K_BACK_SPACE 
                    || event.keyCode == Keys.K_F1
                    || event.keyCode == Keys.K_F5
                    || event.keyCode == Keys.K_F6
                    || event.keyCode == Keys.K_F7
                    || event.keyCode == Keys.K_TAB) {
                    event.preventDefault();
                }
                CSys.keytab[event.keyCode as Keys] = 1;
            }

            document.onkeyup = function (event: KeyboardEvent) {
                event = event || window.event as KeyboardEvent;
                CSys.keytab[event.keyCode as Keys] = 0;
            }

            document.onmousedown = function (event: MouseEvent) {
                CSys.mousekeystate[event.button] = 1;
            }

            document.onmouseup = function (event: MouseEvent) {
                CSys.mousekeystate[event.button] = 0;
            }

            document.onmousemove = function (event: MouseEvent) {
                CSys.mouseX = event.offsetX;
                CSys.mouseY = event.offsetY;

                CSys.lockMouseX+=event.movementX;
                CSys.lockMouseY+=event.movementY;
            }

            document.onwheel = function (event: WheelEvent) {
                CSys.mouseWhellDelta = -event.deltaY;
            }

            document.onclick = function (event: Event) {
                event.preventDefault();
            }

            document.addEventListener('contextmenu', event => event.preventDefault());
        }

        static Run(): void {
            //while (1) {
            {
                //if (!WinControl()) break;

                var md = CSys.GetMouseWheelDelta();
                if (md > 0) CSys.SimulateKey(Keys.K_PAGE_UP);
                if (md < 0) CSys.SimulateKey(Keys.K_PAGE_DOWN);
                //if (MouseKeyPressed(WINGRAPH_MMID)) {wingraph_mousekeystate[1]=0; SetCur();}

                for (var i = 0; i < 256; i++)
                    CSys.keytab[i] |= CSys.simulatedkeytab[i];

                var shift = 0, ctrl = 0;
                if (CSys.KeyPressed(Keys.K_SHIFT)) shift = 256;
                if (CSys.GetKey(Keys.K_CONTROL)) ctrl = 65536;
                if (ctrl == 0) {
                    for (var i = 0; i < 256; i++) {
                        if (CSys.KeyPressed(i)) CSys.activeWin().KeyFunc(i | shift);
                    }
                    if (CSys.MouseKey()) 
                    {
                        CSys.windows[CSys.activewin].KeyFunc(shift);
                        if (CSys.activewin==Windows.Win_Con) {
                            CSys.mousekeystate=[];
                        }
                    }
                    //todo
                    if (CSys.KeyPressed(Keys.K_F1)) {
                        window.open('help.html', '_blank');
                    }
                    if (CSys.KeyPressed(Keys.K_F4)) 
                    {
                        CSys.SetActiveWindow(Windows.Win_Con);
                    }
                    if (CSys.KeyPressed(Keys.K_F5)) 
                    {
                        CSys.SetActiveWindow(Windows.Win_Graph);
                    }
                    if (CSys.KeyPressed(Keys.K_F6)) 
                    {
                        CSys.SetActiveWindow(Windows.Win_GraphTester);
                    }
                } else {
                    //todo
                }

                shift = CSys.keytab[Keys.K_SHIFT];
                ctrl = CSys.keytab[Keys.K_CONTROL];
                for (var i = 0; i < 256; i++)
                    CSys.keytab[i] = 0;
                CSys.keytab[Keys.K_SHIFT] = shift;
                CSys.keytab[Keys.K_CONTROL] = ctrl;
                for (var i = 0; i < 256; i++) {
                    CSys.keytab[i] &= ~CSys.simulatedkeytab[i];
                    CSys.simulatedkeytab[i] = 0;
                }

                //#ifdef MENU
                //todo
                //#endif

                if (CSys.activeWin().GetBuf() != CSys.getBuf())
                    CSys.activeWin().Change(CSys.getBuf());
                CSys.activeWin().Process();
                if (CSys.PresentWait == 0) CSys.presentBuf();
            }
            requestAnimationFrame(CSys.Run);
        }

        private static activeWin(): Drawing.CWin {
            return CSys.windows[CSys.activewin];
        }

        static SetWindow(w: Drawing.CWin, num: Windows): void {
            CSys.windows[num] = w;
        }

        static SetActiveWindow(num: Windows): void {
            CSys.windows[CSys.activewin].ChangeActiveState(0);
            CSys.activewin = num;
            CSys.windows[CSys.activewin].ChangeActiveState(1);
            CSys.unlockMouse();
        }

        static KeyPressed(code: Keys): boolean {
            return CSys.keytab[code.valueOf()] == 1;
        }

        static GetKey(code: Keys): boolean {
            var pressed = CSys.keytab[code.valueOf()] == 1;
            CSys.keytab[code.valueOf()] = 0;
            return pressed;
        }

        static getBuf(): Uint32Array {
            if (!CSys.buf) {
                var ctx = CSys.getDrawingContext();
                CSys.imgData = ctx.getImageData(0, 0, CSys.ScrWidth, CSys.ScrHeight);
                var data = CSys.imgData.data;
                var arrayBuf = new ArrayBuffer(CSys.imgData.data.length);
                CSys.buf8 = new Uint8ClampedArray(arrayBuf);
                CSys.buf = new Uint32Array(arrayBuf);
            }

            return CSys.buf;
        }

        private static getDrawingCanvas(): HTMLCanvasElement {
            return document.getElementById("buf") as HTMLCanvasElement;
        }

        private static getDrawingContext(): CanvasRenderingContext2D {
            return CSys.getDrawingCanvas().getContext("2d");
        }

        private static presentBuf(): any {
            CSys.imgData.data.set(CSys.buf8);
            var ctx = CSys.getDrawingContext();
            ctx.putImageData(CSys.imgData, 0, 0);
        }

        static GetMouseWheelDelta(): number {
            var delta = CSys.mouseWhellDelta;
            CSys.mouseWhellDelta = 0;
            return delta;
        }

        static SimulateKey(code: Keys): void {
            CSys.simulatedkeytab[code.valueOf()] = 1;
        }

        static MouseKeyPressed(key: Keys): boolean {
            return CSys.mousekeystate[key.valueOf()] == 1;
        }

        static MouseKey(): number {
            return CSys.mousekeystate[Keys.M_LEFT] | CSys.mousekeystate[Keys.M_RIGHT] << 1;
        }

        static getMouseX(): number {
            return CSys.isMouseLocked? CSys.lockMouseX : CSys.mouseX;
        }

        static getMouseY(): number {
            return CSys.isMouseLocked? CSys.lockMouseY : CSys.mouseY;
        }

        private static lockMouseX: number;
        private static lockMouseY: number;
        private static isMouseLocked: boolean=false;
        static cursorPosSet(x: number, y: number): void {
            //cannot be implemented in browser environment. This is workaround which uses requestPointerLock

            CSys.lockMouseX=CSys.mouseX;
            CSys.lockMouseY=CSys.mouseY;

            if (x<0 && CSys.isMouseLocked) {
               CSys.unlockMouse();
            }
            else if (x>=0 && !CSys.isMouseLocked){
                
                CSys.getDrawingCanvas().requestPointerLock();
                CSys.isMouseLocked=true;
            }
        }

        static unlockMouse(): void {
            document.exitPointerLock();
            CSys.isMouseLocked=false;
        }

        static AddVar(name: string, addr: ICB, flags: number) {
            var e = new Expressions.ELEMENT(name, addr, 0, 0, 0, flags);
            CSys.varlib.addElement(e);
        }

        static DelVar(name: string) {
            CSys.varlib.delElement(name);
        }

        static ExecCfg(): void {
            //todo
        }

        static VidMode(w: number, h: number): void {
            //todo
        }

        static GetTime(): number {
            return new Date().getTime() / 1000;
        }

        private static __ScrWidth(...args: any[]): number {
            if (args.length == 1)
                CSys.ScrWidth = args[0];
            else
                return CSys.ScrWidth;
        }

        private static __ScrHeight(...args: any[]): number {
            if (args.length == 1)
                CSys.ScrWidth = args[0];
            else
                return CSys.ScrWidth;
        }

        private static __Color(...args: any[]): any {
            if (args.length == 1)
                CSys.Color = args[0];
            else
                return CSys.Color;
        }
    }

    export enum Windows {
        Win_Con,
        Win_Graph,
        Win_GraphTester,
        Win_Sound,
        Win_Help,
        Win_Winlib
    };
}