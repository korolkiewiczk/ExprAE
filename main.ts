module ExprAE {
    export class Main {
        private expr: Expressions.CExpr;

        main(): void {
            System.CSys.Init();
            var library = new Expressions.CLib();
            var stdlib = new Expressions.Stdlib();
            stdlib.init(library);

            this.expr = new Expressions.CExpr(library);

            var libwin: Console.CLibWin = new Console.CLibWin(
                System.CSys.ScrWidth,System.CSys.ScrHeight,System.CSys.getBuf(),
                20,20,System.CSys.ScrWidth-20,System.CSys.ScrHeight*2/3,library);
            /*libwin=new CLibWin(System.CSys.ScrWidth,System.CSys.ScrHeight,buf,
                20,20,System.CSys.ScrWidth-20,System.CSys.ScrHeight*2/3,library);*/

            var con = new Console.CCon(System.CSys.ScrWidth, System.CSys.ScrHeight, System.CSys.getBuf(), new Expressions.POINTER(this, this.comp), libwin);
            var graph = new Graph.CGraphTester(System.CSys.ScrWidth, System.CSys.ScrHeight, System.CSys.getBuf());
            /*sound=new CSound(System.CSys.ScrWidth,System.CSys.ScrHeight,buf);
            CGraph::currentgraph=graph;
            CSound::currentsound=sound;
            CCon::currentcon=con;
            System.CSys.SetDMode(CGraph::K2DF1);
            help=new CHelp(System.CSys.ScrWidth,System.CSys.ScrHeight,buf,"readme.txt");
            UserFunc_Init(library);
            */
            System.CSys.SetWindow(con, System.Windows.Win_Con);
            System.CSys.SetWindow(graph, System.Windows.Win_GraphTester);
            /*System.CSys.SetWindow(help,System.CSys.Win_Help);
            System.CSys.SetWindow(sound,System.CSys.Win_Sound);
            System.CSys.SetWindow(libwin,System.CSys.Win_Winlib);*/
            //System.CSys.SetActiveWin(System.CSys.Win_Con);
            //System.CSys.SetActiveWindow(System.Windows.Win_Graph);
            System.CSys.SetActiveWindow(System.Windows.Win_Con);
            System.CSys.Run();
        }

        comp(th: any, s: string): string {
            var result = (th.expr as Expressions.CExpr).set(s);
            if (result==Expressions.ErrorCodes.NoErr) {
                return th.expr.do();
            }
            else {
                return "\04"+Expressions.ErrorCodes[result];
            }
        }
    }
}