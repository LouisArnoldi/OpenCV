'strict mode'

//  HINWEISE
//  opencv.js Datei enthält ein OpenCV JS Compiler, der OpenCV für JS bereitstellt
//  
//  - OpenCV-Funktionen werden mit cv.Funktionsname() geladen, das unterscheidet sich deutlich zu OCV in anderen Prog.-Sprachen
//  - Funktionen, die mit Großbuchtstaben beginnen, benötigen einen Konstruktor mit "new"
//
//
//  - Elemente, Deklarationen nicht verändern
//  - cv verweisen auf Methoden im opencv.js file  
//  - var Module verweist auf emscripten (OpenCV JS Compiler)
//  
//  WARUM function setURL ?
//  Benötigt durch HTML: damit es durch <img>-Tag verarbeitet werden kann, muss es konvertiert werden.
//  OpenCV kann dann auf die URL zugreifen. 
//
//////////////////////////////////////////////////////////// 

//catch "imageSrc": the image itself
let imgElement = document.getElementById('imageSrc');
//catch "fileInput" from class "caption", need it to set URL for the image (imgElement)
let inputElement = document.getElementById('fileInput');

//when file selected, then
//  function:
//  take the file, create a URL for it, and set that URL as the source for the image element (imgElement)
inputElement.addEventListener('change',
    function setURL(input) {
        ocrService(imgElement, ocrResultBeforeOCV);
        imgElement.src = URL.createObjectURL(input.target.files[0]);
    }, false);

//if image loaded, execute function:
//  using OpenCV Library with cv
//      BASIC FUNCTION
//      1   reading image data (imgElement), save as "mat"
//      2   display the image data on HTML canvas (canvasOutput)
//      3   after displaying delete image data 
imgElement.onload = function readAndShowImageWithOCV() {
    //Mat objects
    let mat = cv.imread(imgElement);
    let bin = new cv.Mat();

    //show image properties
    console.log('!!! BEFORE CONV !!! image width: ' + mat.cols + '\n' +
        'image height: ' + mat.rows + '\n' +
        'image size: ' + mat.size().width + '*' + mat.size().height + '\n' +
        'image depth: ' + mat.depth() + '\n' +
        'image channels ' + mat.channels() + '\n' +
        'image opencv type: ' + mat.type() + '\n' +
        'img js typeof: ' + typeof (mat));

    //convert to grayscale
    cv.cvtColor(mat, mat, cv.COLOR_BGR2GRAY, 0);
    //convert to binary 
    cv.adaptiveThreshold(mat, bin, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY_INV, 15, -2)

    //erode, dilate lines
    //order of arguments: src, dst, kernel (structuring element), pos. of anchor

    //HORIZONTAL morphology op.
    let horizontal = bin.clone();
    let hSize = mat.cols / 1
    let hKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(hSize, 1));

    cv.erode(horizontal, horizontal, hKernel, new cv.Point(-1, -1));
    cv.dilate(horizontal, horizontal, hKernel, new cv.Point(-1, -1));

    //VERTICAL morphology op.
    let vertical = bin.clone();
    let vSize = mat.rows / 1
    let vKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(1, vSize));

    cv.erode(vertical, vertical, vKernel, new cv.Point(-1, -1));
    cv.dilate(vertical, vertical, vKernel, new cv.Point(-1, -1));

    //create mask
    horizontal.copyTo(vertical, horizontal);
    //use mask
    vertical.copyTo(mat, vertical);

    //show image properties after editing
    console.log('IMAGE PROPERTIES AFTER EDITING: \n' +
        'image depth: ' + mat.depth() + '\n' +
        'image channels ' + mat.channels() + '\n' +
        'image openCV type: ' + mat.type() + '\n' +
        'img typeof: ' + typeof (mat));

    //output on html canvas
    cv.imshow('canvasOutput', mat);

    //generate image to export
    let resultCanvas = document.createElement("canvas");
    cv.imshow(resultCanvas, mat);
    ocvResult = resultCanvas.toDataURL("image/jpeg"); // Store the Base64 data URL
    console.log("create ocvResult, contains URL of jpeg as " + typeof(ocvResult));

    //call ocr service
    ocrService(ocvResult, ocrResultAfterOCV);

    //delete memory every time is important
    mat.delete();
    bin.delete();
    horizontal.delete();
    vertical.delete();
};


//Refresh the status 
//External module; source: https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
var Module = {
    onRuntimeInitialized() {
        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    }
};

