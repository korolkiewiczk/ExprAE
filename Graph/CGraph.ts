/// <reference path="../Drawing/CWin.ts" />

module ExprAE.Graph {
    
    import keys = ExprAE.System.Keys;
    import csys = ExprAE.System.CSys;
    import cexpr = ExprAE.Expressions.CExpr;

    export class CGraph extends Drawing.CWin {

        static DEFAULT_JWIDTH = 10;
        static POSDELTA = 4;
        static SCALEDELTA = 1.1;
        static MAXFUNCCOUNT = 8;
        static MAXDRAWINGTIME = 0.02;
        static DLINES = 16;
        static MINADELTA = 40;
        static DEFAULTVANLGE = 90*Math.PI/180;
        static DEFAULTR = 40;
        static DEFAULTD = 0.5;
        static MINPROJECTZ = 0.1;
        static DMUL = 0.50132;
        static ZBUFMUL = 64;
        //static GRAPHTAB_SIZE(a) = ((a)*(a)+(2*a));
        static CUBEMAPTEXID = 64;

        static NOFUNCTEXT = "No function defined!";

        static Color: number[] = new Array(
        
            D.RGB32(255,255,255),
            D.RGB32(255,0,0),
            D.RGB32(0,255,0),
            D.RGB32(0,0,255),
            D.RGB32(255,255,0),
            D.RGB32(255,0,255),
            D.RGB32(0,255,255),
            D.RGB32(255,128,0)
        );

        private Palette: number[][] = [];

        private s: number[] = [];
        private cj: number[] = [];
        private cp: number[] = [];
        private j: number[] = [];
        private p: number[] = [];
        
        private reqredraw: number = 0;
        
        private repmode: number = 0;
        private titles: number = 0;
        private axison: number = 0;
        private gridon: number = 0;
        private geps: number = 0; //dokladnosc wynikow w postaci 10^(-geps)
        private fitscr: number = 0; //czy ma dopasowac wykresy do ekranu
        
        private fps: number = 0;        //liczba klatek na sekunde
        private timer: number = 0;      //miernik czasu rysowania
        private frames: number = 0;     //ilosc wygenerowanych klatek
        private timer0: number = 0;     //czas poczatkowy dla liczenia sredniej liczby fps
        private fpsmode: number = 0;    //tryb pokazywania liczby fps'ow
        
        private cursorx: number = 0;
        private cursory: number = 0;
        
        /*zmienne dla funkcji parametrycznej okreslajace przedzial
        zmiennosci zmiennej t (od t1 do t2 ze zmiana dt)*/
        private t1: number = 0;
        private t2: number = 0;
        private nt: number = 0;
        
        //dane dla 3D
        private vangle: number = 0;       //kat widocznosci
        private A: number[] = []; //katy, np. a[AxisZ] oznacza katy obrotu wokol osi OZ
        private R: number = 0;    //promien widocznowsci
        private D: number = 0;    //odleglosci miedzy punktami siatki
        private N: number = 0;      //2*R/D
        
        private width_div_2: number = 0;
        private height_div_2: number = 0;
        private sinax: number = 0;
        private cosax: number = 0;
        private sinay: number = 0;
        private cosay: number = 0;
        private sinaz: number = 0;
        private cosaz: number = 0; //obliczone wczesniej sinusy i cosinusy
        
        private lightdist: number = 0; //odleglosc dla ktorej nie widac juz obiektu
        
        private changepos3dmode: number = 0;           //szybkosc zmainy pozycji w trybie 3d
                                                                                                                                    //0-rowne D, 1-1/256*R
        
        //wlacz lub wylacz zmiane natezenia koloru w zaleznosci od odleglosci
        //jezeli wyl to natezenie zalezy dla kazdego polozenia od lightdist(255-najjasniejsze)
        private holdlight: number = 0;
        
        //jesli wlaczone to modyfikowany jest wektor swiatla
        private modlvec: number = 0;
        
        //punkt kamery
        private xs: number = 0;
        private ys: number = 0;
        private zs: number = 0;
        //punkt kamery zatrzymany
        private hxs: number = 0;
        private hys: number = 0;   //srodek punktu rysowania
        private cx1: number = 0;
        private cy1: number = 0;
        private cx2: number = 0;
        private cy2: number = 0;
        
        //TABLICE DANYCH WYKRESU
        private valtab: number[] = []; //tablica z obliczonymi wartosciami funkcji, przydzielana dynamicznie
        private projecttab: IPOINT[] = []; //tablica przetworzonych-rzutowanych wierzcholkow
        private colortab: number[] = []; //bufor koloru dla rysowania trojkatow
        private normaltab: VEC[] = []; //tablica wektorow normalnych
        private texcoordtab: VEC2[] = []; //tablica wspolzednych tekstury
        
        private zbuf: Uint32Array;     //bufor glebi dla softa
        
        //status wykonywanych operacji 0-projectbuf,2-normaltab,4-colortab,6-rysowanie.
        //nieparzyste-w trakcie
        private dstate: number = 0;
        
        private hold: number = 0;        //czy wstrzymac obliczanie valtab-w tym trybie rysowana jest tylko 1 funkcja
        
        //sposoby rysowania w 3D
        private dmethod: DrawMethod;
        
        //czy oswietlenie
        lighting: number = 0;
        
        //czy oswietlenie rozne dla przedniej i tylnej powierzchni
        twosidelighting: number = 0;
        
        //wektor oswietlenia
        light_vec: number[] = [];

        //listy wyrazen i nazw
        private dexprlist: Expressions.CExpr[];
        private dfuncstruct: FUNCSTRUCT[];
        private dstack: number[] = [];
        private dstackl: number = 0;
        
        //tekstrury dla wykresow
        tex: Drawing.CTex[] = [];
        envmap: Drawing.CTex[] = [];
    
        //wartosci obliczone w celu przyspieszenia obliczen
        private _255_lightdist: number = 0;
        //wyrazenie dla funckcji circlefunc
        private circfunc_expr: Expressions.CExpr;
        private circfunc_dir: number = 0;
        private circfunc_palwsk: number = 0;
        private circfunc_disty: number = 0;
        private circfunc_D2: number = 0; //D*D
        private circfunc_D4: number = 0; //D*D*D*D
        private circfunc_1_2_D: number = 0; //D/2
        private circfunc_constcol: number = 0;
        private circfunc_tex: Drawing.CTex;

        private gms: GAMEMODESTRUCT;
        private gamemodeon: number = 0;
        private physicsmodel: number = 0;

        private envmapon: number = 0;

        DMode: number = 0;
        GraphState: number = 0;

        constructor(width: number, height: number, buf: Uint32Array, 
            private stdlib: Expressions.Stdlib) {
            super(width,height,buf);

            this.p[Axis.X]=this.width;
            this.p[Axis.Y]=this.height;
            this.width_div_2 = this.width >> 1;
            this.height_div_2=this.height>>1;
            this.vangle=CGraph.DEFAULTVANLGE;
            this.setzdist();
            this.N=0;
            this.valtab=[];
            this.fitscr=0;
            this.changepos3dmode=0;
            this.gms=new GAMEMODESTRUCT();

            this.defaults();
            
            this.dexprlist = [];
            this.dfuncstruct = Array.apply(null, Array(CGraph.MAXFUNCCOUNT)).map(function() {return new FUNCSTRUCT(0,0)});
            
            //dexprlist[CGraph.MAXFUNCCOUNT]=cexpr(cexpr.GetLib());
            //this.dexprlist[CGraph.MAXFUNCCOUNT+1]=cexpr(cexpr.GetLib());
            this.valtab=[];
            this.projecttab=[];
            this.normaltab=[];
            this.colortab=[];
            this.texcoordtab=[];
            this.zbuf=new Uint32Array(width*height);
        /*#ifdef OPENGL
            gl_colortab=0;
            gl_vertextab=0;
            gl_indextab=0;
        
            gl_light_ambient[0]=0.0f;
            gl_light_ambient[1]=0.0f;
            gl_light_ambient[2]=0.0f;
            gl_light_ambient[3]=1;
            gl_light_diffuse[0]=1;
            gl_light_diffuse[1]=1;
            gl_light_diffuse[2]=1;
            gl_light_diffuse[3]=1;
            gl_light_specular[0]=0.5;
            gl_light_specular[1]=0.5;
            gl_light_specular[2]=0.5;
            gl_light_specular[3]=1;
            gl_light_emission[0]=0.0f;
            gl_light_emission[1]=0.0f;
            gl_light_emission[2]=0.0f;
            gl_light_emission[3]=1;
            gl_shininess=120.f;
            gl_used=1;
            csys.AddVar("gl_light_ambient",&gl_light_ambient,VAR_number);
            csys.AddVar("gl_light_diffuse",&gl_light_diffuse,VAR_number);
            csys.AddVar("gl_light_specular",&gl_light_specular,VAR_number);
            csys.AddVar("gl_shininess",&gl_shininess,VAR_number);
            
        /*#ifdef CG
            initshaders();
        #endif
        #endif*/
        
            this.reqredraw=1;
            this.repmode=0;
            this.titles=1;
            this.dmethod=DrawMethod.MLINE;
            this.lighting=0;
            this.gridon = 0;
            this.axison=1;
            this.dstackl=0;
            this.geps=3;
            this.fpsmode=0;
            this.light_vec[3]=0;
            this.lightdist=CGraph.DEFAULTR*4;

            //todo textures
            //for (i: number=0; i<CGraph.MAXFUNCCOUNT; i++) this.tex[i].Load(0);
            //for (i: number=0; i<6; i++) {this.envmap[i].SetAsCubeMapTex(i,CGraph.CUBEMAPTEXID); this.envmap[i].Load(0);}
            
            //dla trybu gry standardowe ustawienia
            this.gms.grav=9.81;
            this.gms.friction=0.25;
            this.gms.player_height=1.8;
            this.gms.player_mass=70*1000;
            this.gms.player_maxvel=8;
            this.gms.player_acc=15;
            this.gms.player_jumpvel=5;
            this.physicsmodel=PhysicsModel.ACCURATE; //model dokladny
            
            //todo variables
            /*csys.AddVar("player_maxvel",&this.gms.player_maxvel,VAR_number);
            csys.AddVar("player_height",&this.gms.player_height,VAR_number);
            csys.AddVar("player_acc",&this.gms.player_acc,VAR_number);
            csys.AddVar("player_jumpvel",&this.gms.player_jumpvel,VAR_number);
            csys.AddVar("gravity",&this.gms.grav,VAR_number);
            csys.AddVar("friction",&this.gms.friction,VAR_number);
            csys.ExecCfg("game");*/
        
            //zmienne trybu wykresu
            /*csys.AddVar("graphcolor",&Color,VAR_RGB);
            csys.AddVar("lightvec",&this.light_vec,VAR_number);
            envmapfile[0]=0;
            csys.AddVar("this.envmap",envmapfile,VAR_STR);
            
            csys.AddVar("pos",&this.j,VAR_number);
            csys.AddVar("angle",&this.A,VAR_number);
            
            csys.ExecCfg("graph");
            csys.DelVar("graphcolor");*/
        /*#ifdef MENU
            initmenu();
        #endif*/
                
        /*#ifdef OPENGL
            gl_defaults();
        #endif*/
        
            this.genpalettes();
            
            this.holdlight=0;
            this.envmapon = 0;

            //todo envmap
            /*if (envmapfile[0]!=0)
            {
                if (loadenvmap(envmapfile)) 
                {
                    envmapon=1;
                    this.lightdist=255;
                    this.holdlight=1;
                }
            }*/
        }

        Change(buf: Uint32Array, width?: number,height?: number): void
        {
            super.Change(buf,width,height);
            
            this.zbuf=new Uint32Array(width*height);
            this.width_div_2 = this.width >> 1;
            this.height_div_2=this.height>>1;
            this.p[Axis.X]=this.width;
            this.p[Axis.Y]=this.height;
            this.setzdist();
            this.s[Axis.X]=this.p[Axis.X]/CGraph.DEFAULT_JWIDTH;
            if (this.fitscr)
            this.s[Axis.Y]=this.p[Axis.Y]/CGraph.DEFAULT_JWIDTH;
            else
            this.s[Axis.Y]=this.p[Axis.Y]/CGraph.DEFAULT_JWIDTH*this.width/this.height;
            this.s[Axis.Z]=this.p[Axis.Z]/CGraph.DEFAULT_JWIDTH;
            this.reqredraw=3;
            this.updatepos();
        /*#ifdef OPENGL
            gl_update();
        /*#ifdef CG
            initshaders();
        #endif
        #endif*/
        }

        KeyFunc(k: number): void
        {
            if (k!=256+keys.K_SHIFT)
            if (this.reqredraw<=1)
            this.reqredraw=1;
            var m=1,s=1,dir=1;
            if (k>>8!=0) {m=4; s=1.2; dir=-1;}
            k&=0xff;
            
            var changepos3ddelta=m;
            if (this.changepos3dmode==0) changepos3ddelta*=this.D;
            else changepos3ddelta*=this.R*(1/256);
            if (k==keys.K_LEFT)
            {
                this.ChangePos(-CGraph.POSDELTA*m,Axis.X);
            }
            else
            if (k==keys.K_RIGHT)
            {
                this.ChangePos(CGraph.POSDELTA*m,Axis.X);
            }
            else
            if (k==keys.K_UP)
            {
                this.ChangePos(CGraph.POSDELTA*m,Axis.Y);
            }
            else
            if (k==keys.K_DOWN)
            {
                this.ChangePos(-CGraph.POSDELTA*m,Axis.Y);
            }
            else
            if (k==keys.K_HOME) 
            {
                this.defaults();
        /*#ifdef OPENGL
                gl_defaults();
        #endif*/
            }
            else
            if (k==keys.K_PAGE_UP)
            {
                if (!this.Is3DMode())
                {
                    this.ChangeScale(CGraph.SCALEDELTA*s,Axis.X);
                    this.ChangeScale(CGraph.SCALEDELTA*s,Axis.Y);
                }
                else
                this.ChangePos(CGraph.POSDELTA*m,Axis.Z);
            }
            else
            if (k==keys.K_PAGE_DOWN)
            {
                if (!this.Is3DMode())
                {
                    this.ChangeScale(1/CGraph.SCALEDELTA/s,Axis.X);
                    this.ChangeScale(1/CGraph.SCALEDELTA/s,Axis.Y);
                }
                else
                this.ChangePos(-CGraph.POSDELTA*m,Axis.Z);
            }
            else
            if (k==keys.K_DELETE)
            {
                this.DelExpr(csys.DColor);
                this.reqredraw=2;
            }
            else
            if ((k==keys.K_TAB)&&(this.hold==0)) this.NextExpr();
            else
            if (k==keys.K_MINUS)
            {
                this.nt-=m*50;
                if (this.nt<50) this.nt=50;
            }
            else
            if (k==keys.K_EQUAL)
            {
                this.nt+=m*50;
            }
            else
            if (k==keys.K_OPEN_BRACKET)
            {
                this.t1-=Math.pow(10,-this.geps+2)*m;
            }
            else
            if (k==keys.K_CLOSE_BRACKET)
            {
                this.t1+=Math.pow(10,-this.geps+2)*m;
            }
            else
            if (k==keys.K_SEMICOLON)
            {
                this.t2-=Math.pow(10,-this.geps+2)*m;
            }
            else
            if (k==keys.K_QUOTE)
            {
                this.t2 += Math.pow(10, -this.geps + 2) * m;
            }
        /*#ifdef CG
            if (k==keys.K_TILDE)
            {
                if (dir<0)
                {
                    if (useshaders>=0)
                    useshaders=1-useshaders;
                }
                else
                {
                    cgs.currentprogram++;
                    if (cgs.currentprogram>=CGPROGRAM_MAX) cgs.currentprogram=0;
                }
            }
            else
            if (k==keys.K_EXT0)
            {
                cgs.currentprogram=CGPROGRAM_DEFAULT;
            }
            else
            if (k==keys.K_EXT1)
            {
                cgs.currentprogram=CGPROGRAM_BM;
            }
            else
            if (k==keys.K_EXT2)
            {
                cgs.currentprogram=CGPROGRAM_ENV;
            }
            else
            if (k==keys.K_EXT3)
            {
                cgs.currentprogram=CGPROGRAM_BMENV;
            }
            else
            if (k==keys.K_EXT4)
            {
                cgs.effect=CGEFFECT_DEFAULT;
                loadcgprograms();
            }
            else
            if (k==keys.K_EXT5)
            {
                cgs.effect=CGEFFECT_NEGATIVE;
                loadcgprograms();
            }
            else
            if (k==keys.K_EXT6)
            {
                cgs.effect=CGEFFECT_SEPIA;
                loadcgprograms();
            }
            else
            if (k==keys.K_EXT7)
            {
                cgs.effect=CGEFFECT_8COLORS;
                loadcgprograms();
            }
            else
            if (k==keys.K_EXT8)
            {
                cgs.effect=CGEFFECT_16COLORS;
                loadcgprograms();
            }
        #endif*/
            else
            if (k==keys.K_Q)
            {
                this.geps+=dir;
                if (this.geps<0) this.geps=0;
                else
                if (this.geps>6) this.geps=6;
            }
            else
            if (k==keys.K_E)
            {
                if (this.envmapon >= 0)
                    this.envmapon = 1 - this.envmapon;
            }
            if (k==keys.K_R)
            {
                if (this.gamemodeon==0)
                this.repmode=1-this.repmode;
            }
            else
            if (k==keys.K_Z)
            {
                this.titles=1-this.titles;
            }
            else
            if (k==keys.K_C)
            {
                this.gridon = 1 - this.gridon;
            }
            else
            if (k==keys.K_G)
            {
                this.twosidelighting=1-this.twosidelighting;
        /*#ifdef OPENGL
                gl_update();
        #endif*/
            }
            else
            if ((k==keys.K_H)&&(this.Is3DMode()))
            {
                if (this.hold) this.hold = 0; else this.hold = -1;
            }
            else
            if (k==keys.K_J)
            {
                this.modlvec=1-this.modlvec;
            }
            else
            if (k==keys.K_K)
            {
                this.holdlight=1-this.holdlight;
                if (this.hold) this.hold = -1;
            }
            else
            if (k==keys.K_L)
            {
                if (dir==1)
                this.lightdist*=CGraph.SCALEDELTA;
                else
                this.lightdist/=CGraph.SCALEDELTA;
                if (this.lightdist<this.D) this.lightdist=this.D;
                if (this.hold) this.hold = -1;
            }
            else
            if (k==keys.K_X)
            {
                this.axison=1-this.axison;
            }
            else
            if ((k==keys.K_N)&&(this.hold==0)&&(this.Is3DMode()))
            {
                if (dir==1)
                this.D/=2;
                else
                this.D*=2;
                if (this.R<4*this.D) this.D/=2;
                if (this.D<CGraph.DEFAULTD/256) this.D=CGraph.DEFAULTD/256;
                this.reqredraw=2;
            }
            else
            if ((k==keys.K_M)&&(this.hold==0)&&(this.Is3DMode()))
            {
                this.R+=this.D*dir;
                if (this.R<4*this.D) this.R=4*this.D;
                this.reqredraw=2;
            }
            else
            if (k==keys.K_V)
            {
                this.vangle+=dir*(Math.PI/180.0);
                if (this.vangle<(Math.PI/180.0)*5) this.vangle=(Math.PI/180.0)*5;
                if (this.vangle>(Math.PI/180.0)*170) this.vangle=(Math.PI/180.0)*170;
                this.setzdist();
                this.reqredraw=2;
        /*#ifdef OPENGL
                gl_update();
        #endif*/  
            }
            else
            if (k==keys.K_B)
            {
                var prm: number = 0;    //todo static
                if (this.gamemodeon) 
                {
                    this.gamemodeon=0;
                    this.repmode=prm;
                }
                else
                {
                    this.gamemodeon=1;
                    this.gms.time=csys.GetTime();
                    prm=this.repmode;
                    this.repmode=1;
                }
            }
            else
            if (k==keys.K_SLASH)
            {
                if (this.physicsmodel==PhysicsModel.SIMPLE) this.physicsmodel=PhysicsModel.ACCURATE;
                else
                this.physicsmodel=PhysicsModel.SIMPLE;
            }
            else
            if (k==keys.K_BACK_SLASH)
            {
                this.fpsmode=1-this.fpsmode;
                if (this.fpsmode==1)
                {
                    this.frames=0;
                    this.timer0=csys.GetTime();
                }
            }
            else
            if (k==keys.K_SPACE)
            {
                if (this.gamemodeon) this.gms.moveplayer|=2;
            }
            else
            if ((k==keys.K_0)&&(this.dfuncstruct[csys.DColor].status!=0))
            {
                var ey=this.stdlib.expr_y;
                this.stdlib.expr_y=this.FJ(this.height-this.cursory,Axis.Y);
                this.cursorx=this.FP(this.Findx0(this.dexprlist[csys.DColor],this.FJ(this.cursorx,Axis.X),this.FJ(this.width,Axis.X) ,1/this.s[Axis.X],0.5*Math.pow(10,-this.geps)),Axis.X);
                csys.cursorPosSet(this.cursorx,this.cursory);
                this.stdlib.expr_y=ey;
            }
            else
            if (k==keys.K_W)
            {
                this.ChangePos3D(changepos3ddelta,this.A[Axis.X],this.A[Axis.Z]);
            }
            else
            if (k==keys.K_S)
            {
                this.ChangePos3D(-changepos3ddelta,this.A[Axis.X],this.A[Axis.Z]);
            }
            else
            if (k==keys.K_A)
            {
                this.ChangePos3D(changepos3ddelta,0,this.A[Axis.Z]+Math.PI/2);
            }
            else
            if (k==keys.K_D)
            {
                this.ChangePos3D(changepos3ddelta,0,this.A[Axis.Z]-Math.PI/2);
            }
            else
            if (k==keys.K_F)
            {
                this.fitscr=1-this.fitscr;
                if (this.fitscr)
                this.s[Axis.Y]/=this.width/this.height;
                else
                this.s[Axis.Y]*=this.width/this.height;
                this.updatepos();
            }
            else
            if (k==keys.K_T)
            {
                if (this.dmethod==DrawMethod.MTEX)
                this.dmethod=DrawMethod.MFILL; else this.dmethod=DrawMethod.MTEX;
        /*#ifdef OPENGL
                gl_update();
        #endif*/
                this.reqredraw=2;
                if (this.hold) this.hold = -1;
            }
            else
            if (k==keys.K_U)
            {
                if (this.dmethod>DrawMethod.MLINE)
                this.dmethod=DrawMethod.MLINE; else this.dmethod=DrawMethod.MFILL;
        /*#ifdef OPENGL
                gl_update();
        #endif*/
                this.reqredraw=2;
                if (this.hold) this.hold = -1;
            }
            else
            if (k==keys.K_I)
            {
                this.lighting=1-this.lighting;
        /*#ifdef OPENGL
                gl_update();
        #endif*/
                this.reqredraw=2;
                if (this.hold) this.hold = -1;
            }
            if (k==keys.K_P)
            {
                this.changepos3dmode=1-this.changepos3dmode;
            }
        //sterowanie opengl 
        /*#ifdef OPENGL
            else
            if (k==keys.K_O)
            {
                gl_used=1-gl_used;
                if (gl_used)
                gl_update();
                this.reqredraw=2;
                if (this.hold) hold=-1;
            }
            else
            if (k==keys.K_Y)
            {
                gl_cull=1-gl_cull;
                gl_update();
                this.reqredraw=2;
            }
        #endif*/ 
            
            //tryby
            //todo
            //for (var i: number=keys.K_1; i<DrawMode.MMAX+keys.K_1; i++) if (k==i) csys.SetDMode(i-keys.K_1);
            
            //mysz
            var mk=csys.MouseKey();
            if (mk)
            {
                if (this.Is3DMode())
                    this.ChangePos3D(changepos3ddelta / 2 * ((mk == 2) ? -1 : 1), this.A[Axis.X], this.A[Axis.Z]);
                else
                {
                    this.ChangePos(CGraph.POSDELTA * m * (2 * (mk == 1 ? 1 : 0) - 1) * (this.cursorx - this.width_div_2) / 100, Axis.X);
                    this.ChangePos(CGraph.POSDELTA*m*(2*(mk==1?1:0)-1)*(-this.cursory+this.height_div_2)/100,Axis.Y);
                }
            }
        
        /*#ifdef MENU 
            //obsluz menu
            setmenustate();
        #endif*/
        }

        Process(): void
        {
            this.timer=csys.GetTime();
            this.handlemouse();
            if (this.dstackl==-2)
            {
                this.dstackl=0;
            }
            else
            if (this.reqredraw)
            {
                if (this.Is3DMode())
                {
                    if (this.dstackl!=-1)
                    {
                        if (this.reqredraw>1) this.dstackl=-2;
                    }
                    else this.dstackl=0;
                }
                else
                {
                    if (this.dstackl!=-1)
                    {
                        if ((this.repmode==0)||(this.reqredraw>1)) this.dstackl=-2;
                    }
                    else this.dstackl=0;
                }
                this.reqredraw=0;
            }
            
            if (this.dstackl==-2)
            {
                this.enddrawfunc();
                return;
            }
            
            if (this.dstackl==0)
            {
                var i: number;
                if (this.dfuncstruct[csys.DColor].status!=0)
                {
                    this.dstack[this.dstackl++] = csys.DColor;
                    this.dfuncstruct[csys.DColor].status=1;
                }
                for (i=0; i<CGraph.MAXFUNCCOUNT; i++)
                    if ((this.dfuncstruct[i].status!=0)&&(csys.DColor!=i))
                    {
                        this.dstack[this.dstackl++] = i;
                        this.dfuncstruct[i].status=1;
                    }
                if (this.dstackl>0)
                    this.begindrawfunc();
                else
                {
                    this.Clear();
                    this.DrawText(this.width_div_2 - CGraph.NOFUNCTEXT.length * this.fontwidth / 2, this.height_div_2 - this.fontheight / 2,
                    csys.Color[csys.CHelp],CGraph.NOFUNCTEXT);
                }
            }
            
            if (this.dstackl>0)
            {
                while (this.dstackl)
                {
                    if (this.dfuncstruct[this.dstack[this.dstackl - 1]].status == 1)
                    {
                        this.dstate=0;
                    }
                    if (!this.drawfunc(this.dexprlist[this.dstack[this.dstackl - 1]], this.dfuncstruct[this.dstack[this.dstackl - 1]])) return;

                    //todo
                    //if (this.gamemodeon) updateplayer();
                    this.dstackl--;
                }
                this.enddrawfunc();
                if (!this.repmode) this.dstackl=-1;
            }
            this.gms.moveplayer=0;
            if (this.hold==-1) this.hold=csys.DColor+1;
        }

        updatepos(): void
        {
            this.cj[Axis.X]=this.j[Axis.X]-this.p[Axis.X]/2/this.s[Axis.X];
            this.cj[Axis.Y]=this.j[Axis.Y]-this.p[Axis.Y]/2/this.s[Axis.Y];
            this.cj[Axis.Z]=this.j[Axis.Z]-this.p[Axis.Z]/2/this.s[Axis.Z];
            this.cp[Axis.X]=this.p[Axis.X]/2-this.s[Axis.X]*this.j[Axis.X];
            this.cp[Axis.Y]=this.p[Axis.Y]/2-this.s[Axis.Y]*this.j[Axis.Y];
            this.cp[Axis.Z]=this.p[Axis.Z]/2-this.s[Axis.Z]*this.j[Axis.Z];
        }

        setzdist(): void { this.p[Axis.Z] = this.width_div_2 / Math.tan(this.vangle / 2); }
            
        defaults(): void
        {
            this.j[Axis.X]=0;
            this.j[Axis.Y]=0;
            this.j[Axis.Z]=0;
            this.s[Axis.X]=this.p[Axis.X]/CGraph.DEFAULT_JWIDTH;
            if (this.fitscr)
            this.s[Axis.Y]=this.p[Axis.Y]/CGraph.DEFAULT_JWIDTH;
            else
            this.s[Axis.Y]=this.p[Axis.Y]/CGraph.DEFAULT_JWIDTH*this.width/this.height;
            this.s[Axis.Z]=this.p[Axis.Z]/CGraph.DEFAULT_JWIDTH;
            this.A[Axis.X]=0;
            this.A[Axis.Y]=0; //nie uzywane
            this.A[Axis.Z]=0;
            this.t1=-5;
            this.t2 = 5;
            this.nt=1000;
            this.light_vec[0]=0;
            this.light_vec[1]=1;
            this.light_vec[2]=0;
            this.R=CGraph.DEFAULTR;
            this.modlvec=0;
            this.hold=0;
            this.twosidelighting=0;
            this.gamemodeon=0;
            this.gms.player_vel=new VEC(0,0,0);
            this.gms.player_accv=new VEC2(0,0);
            this.D=CGraph.DEFAULTD;
            this.cursorx=csys.getMouseX();
            this.cursory=csys.getMouseY();
            this.updatepos();
        }


        rotate(x: number,y: number,z: number): VEC
        {
            //OZ
            var xr=x*this.cosaz+y*this.sinaz;
            var yr=-x*this.sinaz+y*this.cosaz;
            //OX
            y=yr;
            var yr=y*this.cosax+z*this.sinax;
            var zr=-y*this.sinax+z*this.cosax;

            return new VEC(xr,yr,zr);
            
            //brak obslugi obrotu wokow osi OY dla przyspeszenia obliczen
            /*//OY
            x=xr;
            z=zr;
            xr=x*cosay+z*this.sinay;
            zr=z*cosay-x*this.sinay;*/
        }

        project(x: number,y: number,z: number): VEC2
        {
            if (z<CGraph.MINPROJECTZ) return VEC2.invalid();
            var xp = Math.round(x * this.p[Axis.Z] / z) + this.width_div_2;
            var yp=-Math.round(y*this.p[Axis.Z]/z)+this.height_div_2;

            return new VEC2(xp,yp);
        }
        
        sqcircorners(x: number,y: number): VEC2[]
        {
            var x1=Math.floor((x-this.R)/this.D)*this.D;
            var y1=Math.ceil((y+this.R)/this.D)*this.D;
            var x2=Math.ceil((x+this.R)/this.D)*this.D;
            var y2=Math.floor((y-this.R)/this.D)*this.D;

            return new Array(new VEC2(x1,y1), new VEC2(x2,y2));
        }
        
        dotproduct(a: VEC,b: VEC): number
        {
            return a.a*b.a+a.b*b.b+a.c*b.c;
        }

        allocbuffers(): void
        {
           //todo
        }

        drawfunc(expr: cexpr,f: FUNCSTRUCT): number
        {
            if (csys.GetTime()-this.timer>CGraph.MAXDRAWINGTIME) return 0;
            
            if (this.DMode == DrawMode.K2DF1)
            {
                this.drawfunc_K2DF1(expr,f);
            }
            
            else
            if (this.DMode == DrawMode.K2DXY)
            {
                if (!this.drawfunc_K2DXY(expr,f)) return 0;
            }
            
            else
            if (this.DMode == DrawMode.K2DF2)
            {
                if (!this.drawfunc_K2DF2(expr,f)) return 0;
            }
            
            //todo 3d part
            return 1;
        }

        begindrawfunc(): void
        {
            this.stdlib.expr_time=csys.GetTime();
            csys.PresentWait=0;
            this.GraphState = (GraphStateEnum.FillMode * (this.dmethod != DrawMethod.MLINE? 1:0)) |
                (GraphStateEnum.EnableTexture*(this.dmethod==DrawMethod.MTEX?1:0))|
                (GraphStateEnum.EnableLight*(this.lighting>0? 1:0))|
                (GraphStateEnum.Enable3DMode*(this.DMode==DrawMode.K3DF2? 1:0))
        /*#ifdef OPENGL
                |(EnableOpenGL*(gl_used>0))
        #endif*/
            ;
            if (this.DMode == DrawMode.K3DF2)
            {
                //obliczenie sinusow i cosinusow
                this.sinax=Math.sin(this.A[Axis.X]);
                this.cosax=Math.cos(this.A[Axis.X]);
                this.sinay=Math.sin(this.A[Axis.Y]);
                this.cosay = Math.cos(this.A[Axis.Y]);
                this.sinaz=Math.sin(this.A[Axis.Z]);
                this.cosaz=Math.cos(this.A[Axis.Z]);
                if (this.modlvec==1)
                {
                    if (this.light_vec[3]==0)
                    {
                        //ustaw wektor swiatla zgodnie z kierunkiem kamery 
                        this.light_vec[1]=-this.sinax;
                        this.light_vec[2]=this.cosax;
                        this.light_vec[0]=this.light_vec[2]*this.sinaz;
                        this.light_vec[2]=this.light_vec[2]*this.cosaz;
                    }
                    else
                    if (this.light_vec[3]==1)
                    {
                        //ustaw wektor swiatla na pozycji kamery
                        this.light_vec[0]=this.j[Axis.X];
                        this.light_vec[1]=this.j[Axis.Z];
                        this.light_vec[2]=-this.j[Axis.Y];
                    }
                }
                csys.PresentWait=1;
                this.xs=this.j[Axis.X];
                this.ys=this.j[Axis.Y];
                this.zs=this.j[Axis.Z];
        /*#ifdef OPENGL
                if (gl_used)
                {
                    glClearColor(GLCOLOR(csys.Color[csys.CPattern]),1);
                    glClear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT);
                    glLoadIdentity();
                    glRotatef(-this.A[Axis.X]*(180.0/Math.PI),1,0,0);
                    glRotatef(-this.A[Axis.Z]*(180.0/Math.PI),0,1,0);
                    drawenv();
                    if (this.light_vec[3]==0)
                    glLightfv(GL_LIGHT0,GL_POSITION,(*: GLnumber)&this.light_vec);
                    glTranslatef(-this.j[Axis.X],-this.j[Axis.Z],j[Axis.Y]);
                    if (this.light_vec[3]==1)
                    glLightfv(GL_LIGHT0,GL_POSITION,(*: GLnumber)&this.light_vec);
        /*#ifdef CG
                    if (useshaders==1)
                    {
                        bindcgprogram(1);
                    }
                    else
                    if (useshaders==0)
                    {
                        bindcgprogram(0);
                    }
        #endif
                }
                else
        #endif*/
                if (this.dmethod!=DrawMethod.MLINE)
                {
                    //memset(this.zbuf,0xff,this.width*this.height*4);
                    this.zbuf.fill(0xffffffff);
                }
                if (this.hold==0)
                {
                    this.hxs=this.j[Axis.X];
                    this.hys=this.j[Axis.Y];
                    //this.cx1,cy1,this.cx2,cy2
                    var vec=this.sqcircorners(this.hxs,this.hys);
                    this.cx1=vec[0].u;
                    this.cy1=vec[0].v;
                    this.cx2=vec[1].u;
                    this.cy2=vec[1].v;
                }
                this.allocbuffers();
                csys.PresentWait=1;
            }
            if (this.repmode) csys.PresentWait=1;
        /*#ifdef OPENGL
            if ((!gl_used)||(!this.Is3DMode())) Clear();
            //if (!gl_used) drawenv();
        #else
            Clear();
        #endif*/
            this.Clear();
            if (this.axison&&(!this.Is3DMode())) this.drawaxis();
            /*cexpr.MultiExec=cexpr.MultiExec_Begin;
            this.dexprlist[CGraph.MAXFUNCCOUNT].Do();
            cexpr.MultiExec=cexpr.MultiExec_Multi;*/
        }
        
        enddrawfunc(): void
        {
            //if (cexpr.MultiExec==cexpr.MultiExec_Once) return;
            if (this.DMode == DrawMode.K3DF2)
            {
        /*#ifdef CG
                if (useshaders==1)
                {
                    bindcgprogram(0);
                }
        #endif*/
                if (this.lighting) this.drawsun();
            }
            
            /*cexpr.MultiExec=cexpr.MultiExec_End;
            this.dexprlist[CGraph.MAXFUNCCOUNT+1].Do();*/
            
            if (this.DMode == DrawMode.K3DF2)
            {
        /*#ifdef OPENGL
                if (gl_used)
                {
                    COpenGL.Present(buf);
                }
        #endif*/
            }
            this.drawinfo();
            if (this.fpsmode==0)
            {
                if (csys.GetTime()-this.stdlib.expr_time>0)
                this.fps=1/(csys.GetTime()-this.stdlib.expr_time);
            }
            else
            {
                this.fps=this.frames/(csys.GetTime()-this.timer0);
            }
            this.frames++;
            csys.PresentWait=0;
            //cexpr.MultiExec=cexpr.MultiExec_Once;
        }

        drawfunc_K2DF1(expr: cexpr,f: FUNCSTRUCT): number
        {
            var color=CGraph.Color[f.color];
            var i: number;
            var x1: number;
            var y1: number;
            var x2: number;
            var y2: number;
            f.status=2;
            
            x1=this.FJ(0,Axis.X);
            for (i=1; i<this.width; i++)
            {
                x2=this.FJ(i,Axis.X);
                this.stdlib.expr_x=x1;
                y1=this.height-this.FP(expr.do(),Axis.Y)+0.5;
                this.stdlib.expr_x=x2;
                y2=this.height-this.FP(expr.do(),Axis.Y)+0.5;
                if (!(D.IS_UD(y1)&&D.IS_UD(y2)))
                {
                    if (D.IS_UD(y1)) y1=this.height-this.FP(0,Axis.Y);
                    else
                    if (D.IS_INFM(y1)) y1=-1000000;
                    else
                    if (D.IS_INFP(y1)) y1=1000000;
                    if (D.IS_UD(y2)) y2=this.height-this.FP(0,Axis.Y);
                    else
                    if (D.IS_INFM(y2)) y2=-1000000;
                    else
                    if (D.IS_INFP(y2)) y2=1000000;
                    if ((Math.abs(y1-y2)<1000)||((Math.abs(y1-y2)<10000)&&(y1*y2>0)))
                    {
                        this.VLine(i-1,y1,((y1+y2)/2),color);
                        this.VLine(i,((y1+y2)/2),y2,color);
                    }
                }
                x1=x2;
            }
            return 1;
        }

        drawfunc_K2DXY(expr: cexpr,f: FUNCSTRUCT): number
        {
            var palwsk=this.Palette[f.color];
            var x1: number;
            var y1: number;
            var x2: number;
            var y2: number;
            if (f.status==1)
            {
                f.status=2;
                this.stdlib.expr_t=this.t1;
            }
            var dt=(this.t2-this.t1)/(this.nt-1);
            if (Math.abs(dt)<=0.000001) return 1;
            expr.do();
            x1=this.stdlib.expr_x;
            y1=this.stdlib.expr_y;
            if (D.IS_UD(x1)) x1=0;
            else
            if (D.IS_INFM(x1)) x1=-10000;
            else
            if (D.IS_INFP(x1)) x1=10000;
                
            if (D.IS_UD(y1)) y1=0;
            else
            if (D.IS_INFM(y1)) y1=-10000;
            else
            if (D.IS_INFP(y1)) y1=10000;
            this.stdlib.expr_t+=dt;
            
            var i=0;
            
            while (this.stdlib.expr_t<=this.t2)
            {
                var w=expr.do();
                var color: number;
                if (w!=0)
                {
                    color=palwsk[Math.floor(w*255)&255];
                
                    x2=this.stdlib.expr_x;
                    y2=this.stdlib.expr_y;
                    
                    if (D.IS_UD(x2)) x2=0;
                    else
                    if (D.IS_INFM(x2)) x2=-10000;
                    else
                    if (D.IS_INFP(x2)) x2=10000;
                    
                    if (D.IS_UD(y2)) y2=0;
                    else
                    if (D.IS_INFM(y2)) y2=-10000;
                    else
                    if (D.IS_INFP(y2)) y2=10000;
                    
                    this.Line(Math.round(this.FP(x1,Axis.X)),Math.round(this.height-this.FP(y1,Axis.Y)),
                                        Math.round(this.FP(x2,Axis.X)),Math.round(this.height-this.FP(y2,Axis.Y)),color);
                }
                x1=x2;
                y1=y2;
                this.stdlib.expr_t+=dt;
                i++;
                if (i>64)
                {
                    if (csys.GetTime()-this.timer>CGraph.MAXDRAWINGTIME) 
                    {
                        return 0;
                    }
                    i=0;
                }
            }
            this.stdlib.expr_t = this.t2;
            var w=expr.do();
            var color: number;
            if (w!=0)
            {
                color=palwsk[Math.floor(w*255)&255];
            }
            else return 1;
            x2=this.stdlib.expr_x;
            y2=this.stdlib.expr_y;
                
            if (D.IS_UD(x2)) x2=0;
            else
            if (D.IS_INFM(x2)) x2=-10000;
            else
            if (D.IS_INFP(x2)) x2=10000;
                
            if (D.IS_UD(y2)) y2=0;
            else
            if (D.IS_INFM(y2)) y2=-10000;
            else
            if (D.IS_INFP(y2)) y2=10000;
                
            this.Line(Math.round(this.FP(x1,Axis.X)),Math.round(this.height-this.FP(y1,Axis.Y)),
                                Math.round(this.FP(x2,Axis.X)),Math.round(this.height-this.FP(y2,Axis.Y)),color);
            return 1;
        }

        private drawfunc_K2DF2_j: number;
        private drawfunc_K2DF2_k: number;
        private drawfunc_K2DF2_bf: number;
        drawfunc_K2DF2(expr: cexpr,f: FUNCSTRUCT): number
        {
            var i: number;
            var dbf: number;
            var palwsk = this.Palette[f.color];

            if (f.status==1)
            {
                this.drawfunc_K2DF2_bf=0;
                this.drawfunc_K2DF2_j=0;
                this.drawfunc_K2DF2_k=0;
                f.status=2;
            }
            
            var d=this.height/CGraph.DLINES;
            var dx=1/this.s[Axis.X];
            var exprx0=this.FJ(0,Axis.X);
            for (; this.drawfunc_K2DF2_j<d; this.drawfunc_K2DF2_j++)
            {
                for(; this.drawfunc_K2DF2_k<CGraph.DLINES; this.drawfunc_K2DF2_k++)
                {
                    if (csys.GetTime()-this.timer>CGraph.MAXDRAWINGTIME) 
                    {
                        return 0;
                    }
                    dbf = this.drawfunc_K2DF2_bf + this.drawfunc_K2DF2_k * d * this.width;
                    this.stdlib.expr_y=this.FJ(-(this.drawfunc_K2DF2_j+this.drawfunc_K2DF2_k*d)+this.height,Axis.Y);
                    this.stdlib.expr_x=exprx0;
                    i=this.width;
                    while(i--)
                    {
                        var w=expr.do();
                        if (w!=0)
                        {
                            this.buf[dbf]=palwsk[Math.floor(w*255)&255];
                        }
                        dbf++;
                        this.stdlib.expr_x+=dx;
                    }
                }
                this.drawfunc_K2DF2_bf += this.width;
                this.drawfunc_K2DF2_k=0;
            }
            return 1;
        }

        drawsun(): void {
            //todo only opengl
        }

        drawaxis(): void
        {
            var bf: string;
            var i: number;
            //rysuj osie
            this.HLine(0,this.height-this.FP(0,Axis.Y),this.width-1,csys.Color[csys.CFaded]);
            this.VLine(this.FP(0,Axis.X),0,this.height-1,csys.Color[csys.CFaded]);
            //pisz wartosci - os x
            var d=this.axisdelta(Axis.X);
            var x1: number;
            var x2: number;
            if (Math.floor(d)!=0)
            {
                x1=Math.floor(this.FJ(0,Axis.X))/Math.floor(d)*Math.floor(d);
                x2=Math.floor(this.FJ(this.width,Axis.X));
            }
            else
            {
                x1=Math.floor(((1/d)*(this.FJ(0,Axis.X)))/(1/d));
                x2=this.FJ(this.width,Axis.X);
            }
            var x: number = 0;
            var y=this.height-Math.floor(this.FP(0,Axis.Y));
            while (x1<=x2)
            {
                if (x1!=0)
                {
                    x=Math.floor(this.FP(x1,Axis.X));
                    this.PutPixel(x,y,csys.Color[csys.CNum]);
                    if (this.gridon) this.VLine(x, 0, this.height, csys.Color[csys.CFaded]);
                    bf=x1.toPrecision(this.geps).replace(/[0\.]+$/,'');
                    this.DrawText3X5(x/*-i*2-1*/,y+2,csys.Color[csys.CNum],bf);
                }
                x1+=d;
            }
            
            //pisz wartosci - os y
            d=this.axisdelta(Axis.Y);
            var y1: number;
            var y2: number;
            if (Math.floor(d)!=0)
            {
                y1=Math.floor(this.FJ(0,Axis.Y))/Math.floor(d)*Math.floor(d);
                y2=Math.floor(this.FJ(this.height,Axis.Y));
            }
            else
            {
                y1=Math.floor(((1/d)*(this.FJ(0,Axis.Y)))/(1/d));
                y2=this.FJ(this.height,Axis.Y);
            }
            x=Math.floor(this.FP(0,Axis.X));
            while (y1<=y2)
            {
                if (y1!=0)
                {
                    y=this.height-Math.floor(this.FP(y1,Axis.Y));
                    if ((x>=0)&&(y>=0)&&(x<this.width)&&(y<this.height))
                    this.PutPixel(x,y,csys.Color[csys.CNum]);
                    if (this.gridon) this.HLine(0, y, this.width, csys.Color[csys.CFaded]);
                    bf=y1.toPrecision(this.geps).replace(/[0\.]+$/,'');
                    this.DrawText3X5(x+2,y-2,csys.Color[csys.CNum],bf);
                }
                y1+=d;
            }
        }

        drawinfo(): void
        {
            var bf: string;
            var i: number;
            var k: number;
            
            if ((this.titles)&&(this.dfuncstruct[csys.DColor].status!=0))
            {
                //lista funkcji
                i=0;
                for (k=0; k<CGraph.MAXFUNCCOUNT; k++)
                {
                    if (this.dfuncstruct[k].status==0) continue;
                    var c: number;
                    if (csys.DColor==this.dfuncstruct[k].color) c=CGraph.Color[this.dfuncstruct[k].color];
                    else c=this.Palette[this.dfuncstruct[k].color][128];
                    this.DrawText3X5(0,i,c,this.dexprlist[k].getExprStr());
                    i+=5;
                }
                
                //liczba klatek na sek.
                //sprnumberf(bf0,"%%0.%df",this.geps);
                //sprnumberf(bf,bf0,this.fps);
                bf=this.fps.toPrecision(this.geps);
                this.DrawText3X5(this.width-bf.length*4-1,0,csys.Color[csys.CHighlighted],bf);
            
                //pozycja kursora
                var x1=this.FJ(this.cursorx,Axis.X);
                var y1 = this.FJ(this.height - this.cursory, Axis.Y);
                if (!this.Is3DMode())
                {
                    //sprnumberf(bf0,"X=%%0.%df Y=%%0.%df",this.geps,geps);
                    //sprnumberf(bf,bf0,x1,y1);
                    bf="X="+x1.toPrecision(this.geps)+" Y="+y1.toPrecision(this.geps);
                    this.DrawText3X5(this.width - bf.length * 4 - 1, this.height - 5, csys.Color[csys.CHighlighted], bf);
                }
                else
                {
        /*#ifdef OPENGL
                    if (gl_used)
                        this.DrawText(width-7*fontwidth-1,height-fontheight-6,csys.Color[csys.CHelp],"OPENGL");
                    else
        #endif*/
                    this.DrawText(this.width - 8 * this.fontwidth - 1, this.height - this.fontheight - 6, csys.Color[csys.CHelp], "SOFTWARE");
                    this.DrawText3X5(this.width - 8 * this.fontwidth + 1, this.height - 6, csys.Color[csys.CFaded], "R E N D E R E R");
                }
                /*this.HLine(this.cursorx-1,this.cursory,this.cursorx+1,csys.Color[csys.CNormal]);
                this.VLine(this.cursorx,this.cursory-1,this.cursory+1,csys.Color[csys.CNormal]);*/
            
                //wartosci funkcji dla danej pozycji kursora
                if (this.DMode == DrawMode.K2DF1)
                {
                    this.stdlib.expr_x=x1
                    //sprnumberf(bf0,"F(%%0.%df)=%%0.%df",this.geps,geps);
                    bf="F("+x1.toPrecision(this.geps)+")="+this.dexprlist[csys.DColor].do().toPrecision(this.geps);
                    //sprnumberf(bf,bf0,x1,this.dexprlist[csys.DColor].Do());
                }
                else
                    if (this.DMode == DrawMode.K2DXY)
                {
                    //sprnumberf(bf0,"this.t1=%%0.%df t2=%%0.%df n=%%d",this.geps,geps);
                    //sprnumberf(bf,bf0,this.t1,t2,this.nt);
                    bf="t1="+this.t1.toPrecision(this.geps)+" t2="+this.t2.toPrecision(this.geps)+" n="+this.nt.toPrecision(this.geps);
                }
                else
                        if (this.DMode == DrawMode.K2DF2)
                {
                    this.stdlib.expr_x=x1;
                    this.stdlib.expr_y=y1;
                    //sprnumberf(bf0,"F(%%0.%df,%%0.%df)=%%0.%df",this.geps,geps,this.geps);
                    bf="F("+x1.toPrecision(this.geps)+","+y1.toPrecision(this.geps)+")="+this.dexprlist[csys.DColor].do().toPrecision(this.geps);
                    //sprnumberf(bf,bf0,x1,y1,this.dexprlist[csys.DColor].Do());
                }
                else
                            if (this.DMode == DrawMode.K3DF2)
                {
                    //sprnumberf(bf0,"X=%%0.%df Y=%%0.%df Z=%%0.%df this.D=%%0.%df this.R=%%0.%df V=%%d M=%%dk",
                    //this.geps,geps,this.geps,geps,this.geps);
                    //sprnumberf(bf,bf0,j[Axis.X],j[Axis.Y],j[Axis.Z],this.D,R,this.N*N,csys.MemAvail()/1024);
                    bf="X="+this.j[Axis.X].toPrecision(this.geps)+" Y="+this.j[Axis.Y].toPrecision(this.geps)+
                    " Z="+this.j[Axis.Z].toPrecision(this.geps)+" D="+this.D.toPrecision(this.geps)+
                    " R="+this.R.toPrecision(this.geps)+" V="+(this.N*this.N).toPrecision(this.geps);    //without M
                }
                this.DrawText3X5(0, this.height - 5, CGraph.Color[csys.DColor], bf);
            }
        }

        ChangeActiveState(state: number): void
        {
            if (state == 0) this.enddrawfunc();
            else
            this.reqredraw=3;
        /*#ifdef MENU
            setmenuactivestate(state);
        #endif*/
        }
        

        genpalettes(): void
        {
            for (var i=0; i<CGraph.MAXFUNCCOUNT; i++) {
                this.Palette[i] = [];
                for (var j = 0; j < 256; j++) this.Palette[i][j] = this.FadeColor(CGraph.Color[i], j);
            }
        }

        FP(j: number, axis: number) {
            return this.s[axis]*j+this.cp[axis];
        }

        FJ(p: number, axis: number) {
            return p/this.s[axis]+this.cj[axis];
        }
        
        axisdelta(axis: number): number
        {
            var d: number;
            var ptab =new Array(1,2,5);
            var m: number;
            var p: number=0;
            var sc=0;
            if (axis == Axis.X) sc = this.width;
            else
                if (axis == Axis.Y) sc = this.height;
            
            d=sc/(this.FJ(sc,axis)-this.FJ(0,axis));
            if (d<CGraph.MINADELTA)
            {
                m=1;
                do
                {
                    p++;
                    if (p>2) {p=0; m*=10;}
                }
                while (d*(ptab[p]*m)<CGraph.MINADELTA);
                return ptab[p]*m;
            }
            if (d>=CGraph.MINADELTA)
            {
                var pm: number;
                var pp: number;
                m=0.1;
                p=2;
                pp=0;
                pm=1;
                while (d*(ptab[p]*m)>=CGraph.MINADELTA)
                {
                    pp=p;
                    pm=m;
                    p--;
                    if (p<0) {p=2; m/=10;}
                }
                return ptab[pp]*pm;
            }
            return 0;
        }

        Is3DMode(): boolean {
            return this.DMode==DrawMode.K3DF2;
        }

        handlemouse(): void
        {
            var cx: number;
            var cy: number;
            cx = csys.getMouseX();
            cy = csys.getMouseY();
            if ((cx!=this.cursorx)||(cy!=this.cursory))
            {
                if (this.Is3DMode())
                {
                    this.A[Axis.Z]+=(this.cursorx-cx)/100;
                    this.A[Axis.X]+=(this.cursory-cy)/100;
                    csys.cursorPosSet(this.width_div_2, this.height_div_2);
                    cx = this.width_div_2;
                    cy=this.height_div_2;
                }
                this.cursorx=cx;
                this.cursory=cy;
                if (this.reqredraw<1)
                this.reqredraw=1;
                if (this.DMode == DrawMode.K2DF1) this.stdlib.expr_y = this.FJ(this.height - this.cursory, Axis.Y);
            }
        }

        ChangePos(d: number,axis: number): void
        {
            this.j[axis]+=d/this.s[axis];
            this.updatepos();
        }

        ChangePos3D(d: number,anglex: number,anglez: number): void
        {
            if (this.gamemodeon)
            {
                d/=Math.abs(d);
                this.gms.player_accv.u=d*-Math.sin(anglez)*this.gms.player_acc;
                this.gms.player_accv.v=d*Math.cos(anglez)*this.gms.player_acc;
                this.gms.moveplayer|=1;
            }
            else
            {
                this.j[Axis.X]-=d*Math.sin(anglez)*Math.cos(anglex);
                this.j[Axis.Y]+=d*Math.cos(anglez)*Math.cos(anglex);
                this.j[Axis.Z]+=d*Math.sin(anglex);
            }
            this.updatepos();
        }
        
        ChangeScale(d: number,axis: number): void
        {
            this.s[axis]*=d;
            this.updatepos();
        }
        
        SetExpr(name: string, expr: cexpr,color: number,num: number): void
        {
            if (num>=CGraph.MAXFUNCCOUNT)
            {
                this.dexprlist[num%(CGraph.MAXFUNCCOUNT+2)]=expr;
            }
            else
            {
                this.dexprlist[num%CGraph.MAXFUNCCOUNT]=expr;
                this.dfuncstruct[num%CGraph.MAXFUNCCOUNT].color=color%CGraph.Color.length;
                this.dfuncstruct[num%CGraph.MAXFUNCCOUNT].status=1;
            }
        }
        
        DelExpr(num: number): void
        {
            this.dfuncstruct[num%CGraph.MAXFUNCCOUNT].status=0;
            this.NextExpr();
        }
        
        NextExpr(): void
        {
            var k=csys.DColor+1;
            for (var i: number=0; i<CGraph.MAXFUNCCOUNT; i++) 
            if (this.dfuncstruct[(k+i)%CGraph.MAXFUNCCOUNT].status!=0) 
            {
                csys.DColor=(k+i)%CGraph.MAXFUNCCOUNT;
                return;
            }
            csys.DColor=0;
        }

        Findx0(expr: cexpr,a: number,b: number,d: number,eps: number): number
        {
            var x1=a;
            var x2=a+d;
            var i=10000;
            while (x1<=b)
            {
                this.stdlib.expr_x=x1;
                var y1=expr.do();
                this.stdlib.expr_x=x2;
                var y2=expr.do();
                if (Math.abs(y1)<=eps) return x1;
                if (y1*y2<0)
                //szukaj metoda polowienia przedzialow miejsce zerowe
                {
                    var s: number=(y1>0)? 1:-1;
                    var y: number;
                    do
                    {
                        this.stdlib.expr_x=0.5*(x1+x2);
                        y=expr.do();
                        if (y*s>0) x1=this.stdlib.expr_x; else x2=this.stdlib.expr_x;
                        i--;
                    } while ((Math.abs(y)>eps)&&(i>0));
                    return this.stdlib.expr_x;
                }
                x1=x2;
                x2+=d;
            }
            return 0;
        }
    }

    export class FUNCSTRUCT
    {
        constructor(
            public color: number,
            public status: number) { //0-brak, 1-do rysowania, 2-rysowana

            } 
    }
    
    //struktura przechowuje wsp. rzutowanego wiercholka
    export class IPOINT
    {
        x: number;
        y: number;
    }
    
    //przechowuje wektor
    export class VEC
    {
        constructor(
            public a: number,
            public b: number,
            public c: number) {

            }
    }
    
    export class VEC2
    {
        constructor(
            public u: number,
            public v: number) {

            }

        static invalid(): VEC2 {
            return new VEC2(-1000000000,-1000000000);
        }
    }
    
    export class GAMEMODESTRUCT
    {
        grav: number;
        friction: number;
        
        player_height: number;
        player_maxvel: number;
        player_acc: number;
        player_jumpvel: number;
        player_mass: number;
        
        player_vel: VEC;
        player_accv: VEC2;
        
        moveplayer: number;
        
        time: number;
    }

    enum DS
    {
        PROJECT  =0,
        NORMAL   =2,
        COL      =4,
        TEX      =6,
        DRAW     =8
    }
    
    enum DrawMode
    {
        K2DF1,  //uk�ad kartezjanski w 2D, funkcja jedno-argumentowa y=f(x)
        K2DF2,  //uk�ad kartezjanski w 2D, funkcja dwu-argumentowa z=f(x,y)
        K3DF2,  //uk�ad kartezjanski w 3D, funkcja dwu-argumentowa z=f(x,y)
        K2DXY,  //uk�ad kartezjanski w 2D, funkcja parametryczna x=x(t), y=y(t)
        MMAX
    };
    
    enum DrawMethod
    {
        MLINE,
        MFILL,
        MTEX,
        DMMAX
    }
    
    enum Axis
    {
        X,
        Y,
        Z
    }

    enum GraphStateEnum
    {
        FillMode=1,
        EnableTexture=2,
        EnableLight=4,
        Enable3DMode=8,
        EnableOpenGL=16
    }

    enum PhysicsModel
    {
        SIMPLE,
        ACCURATE
    }
}
