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

        private static windows: Drawing.CWin[];
        private static activewin: number;
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

        private static simulatedkeytab: number[];
        private static keytab: number[];

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
            CSys.AddVar("scrwidth", CSys.__ScrWidth, CSys.VAR_DWORD);
            CSys.AddVar("scrheight",CSys.__ScrHeight, CSys.VAR_DWORD);
            CSys.AddVar("color",CSys.__Color, CSys.VAR_RGB);
            CSys.ExecCfg();
            CSys.DelVar("scrwidth");
            CSys.DelVar("scrheight");

            /*#ifdef MENU
                InitMenu();
            #endif*/

            CSys.VidMode(CSys.ScrWidth, CSys.ScrHeight);

            CSys.SRand0=(new Date().getTime());
        }

        Run(): void {
            while (1) {
                //if (!WinControl()) break;
                
                var md=CSys.GetMouseWheelDelta();
                if (md>0) CSys.SimulateKey(Keys.K_PAGE_UP);
                if (md<0) CSys.SimulateKey(Keys.K_PAGE_DOWN);
                //if (MouseKeyPressed(WINGRAPH_MMID)) {wingraph_mousekeystate[1]=0; SetCur();}

                for (var i=0; i<256; i++) 
                    CSys.keytab[i]|=CSys.simulatedkeytab[i];

                var shift=0,ctrl=0;
                if (CSys.KeyPressed(Keys.K_SHIFT)) shift=256;
                if (CSys.KeyPressed(Keys.K_CONTROL)) ctrl=65536;
                if (ctrl==0) {
                    //todo
                }
                //todo keys

                CSys.windows[CSys.activewin].Process();
                //if (PresentWait==0) PresentBuf();
            }
        }

        static KeyPressed(code: Keys): boolean {
            return CSys.keytab[code.valueOf()] == 1;
        }

        static GetKey(code: Keys): boolean {
            var pressed = CSys.keytab[code.valueOf()] == 1;
            CSys.keytab[code.valueOf()]=0;
            return pressed;
        }

        static GetMouseWheelDelta(): number {
            return 0; //todo mouse delta
        }

        static SimulateKey(code: Keys): void {
            CSys.simulatedkeytab[code.valueOf()]=1;
        }

        static AddVar(name: string, addr: ICB, flags: number) {
            var e: Expressions.ELEMENT;
            e.name = name;
            e.fptr = addr;
            e.tag = flags;
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
}