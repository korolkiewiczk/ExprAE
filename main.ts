module ExprAE {
    export class Main {
        private expr: Expressions.CExpr;
        private graph: Graph.CGraph;

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

            var con = new Console.CCon(System.CSys.ScrWidth, System.CSys.ScrHeight, System.CSys.getBuf(), this.comp.bind(this), libwin);
            var graphTester = new Graph.CGraphTester(System.CSys.ScrWidth, System.CSys.ScrHeight, System.CSys.getBuf());

            this.graph = new Graph.CGraph(System.CSys.ScrWidth, System.CSys.ScrHeight, System.CSys.getBuf(), stdlib)

            var imagesLib=new Libraries.Images(this.graph);
            imagesLib.init(library);
            /*sound=new CSound(System.CSys.ScrWidth,System.CSys.ScrHeight,buf);
            CGraph::currentgraph=graph;
            CSound::currentsound=sound;
            CCon::currentcon=con;
            System.CSys.SetDMode(CGraph::K2DF1);
            help=new CHelp(System.CSys.ScrWidth,System.CSys.ScrHeight,buf,"readme.txt");
            UserFunc_Init(library);
            */
            System.CSys.SetWindow(con, System.Windows.Win_Con);
            System.CSys.SetWindow(this.graph, System.Windows.Win_Graph);
            System.CSys.SetWindow(graphTester, System.Windows.Win_GraphTester);
            /*System.CSys.SetWindow(help,System.CSys.Win_Help);
            System.CSys.SetWindow(sound,System.CSys.Win_Sound);
            System.CSys.SetWindow(libwin,System.CSys.Win_Winlib);*/
            //System.CSys.SetActiveWin(System.CSys.Win_Con);
            //System.CSys.SetActiveWindow(System.Windows.Win_Graph);
            System.CSys.SetActiveWindow(System.Windows.Win_Con);
            System.CSys.Run();
        }

        comp(s: string): string {
            var th = this;
            var result = (th.expr as Expressions.CExpr).set(s);
            if (result==Expressions.ErrorCodes.NoErr) {
                var value = th.expr.do();
                if (typeof value == "number") {
                    th.graph.SetExpr(s, th.expr, System.CSys.DColor, System.CSys.DColor);
                    return s+"="+value;
                } else {
                    return value;
                }
            }
            else {
                return "\u0004"+Expressions.ErrorCodes[result];
            }
        }
    }
}