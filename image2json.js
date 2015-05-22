$(function(){
    // JSON schema
    // var j={1:{1:2},"ben":"dick"};
    var jImg, jData;

    // helper classes
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    // set up display and output canvas's
    var canvas = document.getElementById("imgCanvas");
    var ctx = canvas.getContext("2d");
    var canvasEx = document.getElementById("imgCanvasExport");
    var ctxEx = canvasEx.getContext("2d");

    // size variables
    var imgWidth, imgHeight;

    // find user pixel size
    var pixelSize = $('#pixelSize').val();

    // img variables
    var imgData, data, exportImg = [];
    var img = new Image;

    // image loader
    var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);

    function handleImage(e){
        var reader = new FileReader();
        reader.onload = function(event){

            img.onload = function(){
                imageLoaded();
            }

            img.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
    }

    // reload image if pixel range changed
    $('#pixelSize').on("input", function(){
        pixelSize = $('#pixelSize').val();

        $("#pixelSizeText").html(pixelSize);

        imageLoaded();
    });


    function imageLoaded() {

        // set canvas size
        imgHeight = img.height;
        imgWidth = img.width;

        ctx.canvas.width = imgWidth;
        ctx.canvas.height = imgHeight;
        ctxEx.canvas.width = imgWidth;
        ctxEx.canvas.height = imgHeight;

        // draw image
        ctx.drawImage(img,0,0);

        imgData = ctx.getImageData(0,0, imgWidth, imgHeight);
        data = imgData.data;

        // get data form image
        getPixels();
    }

    function getPixels(){
        exportImg = [];

        for (var y = 0; y < imgHeight; y++){
            exportImg[y] = [];

            for (var x = 0; x < imgWidth; x++){

                var dataNum = ((imgWidth*y)+x)*4

                exportImg[y][x] = [
                        data[dataNum],    // r
                        data[dataNum+1],  // g
                        data[dataNum+2],  // b
                        data[dataNum+3]   // a
                    ]
            }
        }
        putPixels();
    }

    function putPixels(){
        var yInt = 0, newRow = true;

        for (y = 0; y < exportImg.length; y+= parseInt(pixelSize, 10)){
            xInt = 0;

            for (x = 0; x < exportImg[y].length; x += parseInt(pixelSize, 10)){

                var r = exportImg[y][x][0];
                var g = exportImg[y][x][1];
                var b = exportImg[y][x][2];
                var a = exportImg[y][x][3];

                ctxEx.fillStyle = 'rgba('+r+','+g+','+b+','+a+')';
                ctxEx.fillRect(x, y, pixelSize, pixelSize);

                //set json data
                if(newRow && yInt == 0 && newRow){ // if first row

                    jImg = '{"0": {"' + xInt +'":"'+ rgbToHex(r,g,b) + '"';
                    newRow = false;

                }else if(newRow && yInt > 0){ // if new row and not first

                    jImg += '}, "' + yInt + '": {"' + xInt +'":"'+ rgbToHex(r,g,b) + '"';
                    newRow = false;

                }else{
                    jImg += ',"' + xInt +'":"'+ rgbToHex(r,g,b) + '"';
                }
                xInt++;
            }
            yInt++;
            newRow = true;
        }
        jImg += '}}'; // end of json encoding

        var saveData = canvasEx.toDataURL(); // save png data
        $('.savePng').attr('href',saveData).show(); // set to href and show link

        createJSON();
    }

    function createJSON(){
        var jsonOut = JSON.stringify(jImg);
        var jsonObj = JSON.parse(jsonOut);

        var blob = new Blob([jsonObj], {type: "application/json"});
        var url  = URL.createObjectURL(blob);

        var a = document.getElementById("saveJson");
        a.download = $('#imageLoader').val() +".json";
        a.href = url;
        a.textContent = "Download " + $('#imageLoader').val() + ".json";
        $('#saveJson').show();
    }
});
