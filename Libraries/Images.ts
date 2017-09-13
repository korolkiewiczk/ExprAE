module ExprAE.Libraries {
    export class Images {

        constructor(
            private graph: Graph.CGraph
        ) {

        }

        init(lib: Expressions.CLib): Expressions.CLib {
            lib.addList(this.funclist);
            return lib;
        }

        private loadImage(numberOfFunc: number): number {
            var th = this;
            const fileUpload = "fileUpload";
            var existing = document.getElementById(fileUpload)
            if (existing) {
                return 0;
            }
            var input = document.createElement('input');
            input.id = fileUpload;
            input.type = "file";
            document.getElementsByTagName('body')[0].appendChild(input);

            input.onchange = function (ev: any) {
                var f = ev.target.files[0];
                var fr = new FileReader();

                fr.onload = function (ev2: any) {
                    var image = new Image();
                    image.onload = function () {
                        var t: HTMLImageElement = this as HTMLImageElement;
                        var w = t.width;
                        var h = t.width;

                        var canvas = document.createElement("canvas");
                        canvas.width = w;
                        canvas.height = h;

                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(t, 0, 0);
                        var data = ctx.getImageData(0, 0, w, h);
                        var tex = new Drawing.CTex();
                        tex.Load(data.data, data.width, data.height);
                        th.graph.loadTex(numberOfFunc, tex);

                        var toRemove = document.getElementById(fileUpload)
                        if (toRemove) {
                            toRemove.remove();
                        }
                    }
                    image.src = ev2.target.result;
                };

                fr.readAsDataURL(f);
            }

            return 1;
        }

        private funclist: Expressions.ELEMENT[] = new Array(
            new Expressions.ELEMENT("LOAD_TEX", this.loadImage, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0, this));
    }
}