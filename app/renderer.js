//preload
const marked = window.marked;
const createDOMPurify = window.createDOMPurify;
const fs = window.fs;
const dialog = window.electron.dialog;
const shell = window.electron.shell;
const path = window.path;
const ejs = window.ejs;
const fse = window.fse;
       
__dirname = path.resolve(); 
//##################################//

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const saveHtmlButton = document.querySelector('#save-html');
const saveHtmlAutomaticButton = document.querySelector('#save-html-automatic');
const saveHtmlTemplate = document.querySelector('#save-html-template');
const openSaveFolderButton = document.querySelector('#open-save-folder');

//###############################################################//

// CONVERT MARKDOWN TO HTML 
const renderToMarkdown = (markdown) => {
    var dirty = marked(markdown);
    const clean = createDOMPurify(dirty); //limpieza
    htmlView.innerHTML = marked(clean); //mostrando markdown en html
}

markdownView.addEventListener("keyup", e => {
    const currentContent = e.target.value;
    renderToMarkdown(currentContent);
} );

//######################### METHODS #################################//
//-------------- PATH SAVED ---------------//
//default directory of files saved
var pathFileSaved = ""; //iniciar vacio

function setPathFileSaved(pathFileSaved){
    this.pathFileSaved = path.dirname(pathFileSaved);
}
function getPathFileSaved(){
    return this.pathFileSaved;
}
//-------------- END PATH SAVED ---------------//

//open and read file
 async function openFile(){

    const dialogOptions = {
        properties: ['openFile'],
        "filters":
                    [   
                        {
                            "name": "Markdown (.md)",
                            "extensions": ["md"]
                        },
                        {
                            "name": "text file (.txt, .text)",
                            "extensions": ["txt", "text"]
                        }, 
                        {
                            "name": "all (.*)",
                            "extensions": ["*"]
                        },                                              
                    ],
    }; //end dielogOptions
    try{        
        const result = await dialog.showOpenDialog(dialogOptions);

        if (result !== undefined && result.filePaths[0] !== undefined){         
            const path_to_read = result.filePaths[0];       
            fs.readFile(path_to_read, 'utf-8', (err, data) => {
            
                if (!fs.existsSync(path_to_read)) console.log("no existe path");
                if (err) {
                    alert("error: " + err.message);
                }else {
                    //alert("Archivo cargado con exito");
                    loadFile(data); //function                    
                    markdownView.focus();
                    markdownView.value+='\n';
                }
            });
        }
    }catch (err) {
        console.log('Read failed:' + err)
    }
} //end openFile

//function to load file after to open
function loadFile(data){     
    markdownView.value = data; //cargar en markdownview    
    renderToMarkdown(data); //cargar y limpiar en htmlView
}

//openFolder download
function openFolder(path, type){
    try{        
        if (!fs.existsSync(path)){
            console.log("path doesn't exist"+path);
            return;
        }
        else if (type == "folder"){
            shell.openItem(path);
        }else if (type == "file"){
            shell.openItem('filepath');    
            //shell.showItemInFolder('filepath'); //mostrar con item seleccionado
        }else return;
    }catch (err) {
        console.log('Error to open:' + err)
    }   
}



/* ###################### BUTTONS ####################### */

//open file
openFileButton.addEventListener("click", () => {
    openFile();
});


openSaveFolderButton.addEventListener("click", () => {  
//directorio por defecto:
var path_to_open = path.join(__dirname, 'files'); //current directory + folder files
//si ha sido guardado el archivo cambiar el directorio para abrir
if (getPathFileSaved() !== undefined || getPathFileSaved() !== ""){
    path_to_open = getPathFileSaved();
}

openFolder(path_to_open, "folder");
});


//save file with dialog -BUTTON => SAVE  (Markdown)
saveMarkdownButton.addEventListener("click", async () => { 

    var data = markdownView.value; //save document markdown to save
    const dialogOptions = {
        filters: [{
            name: 'Markdown (.md)',
            extensions: ['md']
        }]        
    };
    saveFile(data, dialogOptions); //function to save with dialog
}); //end saveMarkdownButton

//save file with dialog -BUTTON => SAVEHTML
saveHtmlButton.addEventListener("click", async () => {
    var data = htmlView.innerHTML; //save document html to save
    const dialogOptions = {
        filters: [{
            name: 'HTML (.html)',
            extensions: ['html']
        }] 
    };
    saveFile(data, dialogOptions); //function to save with dialog
}); //end saveHtmlButton


async function saveFile(data, dialogOptions){

    try {        
           const result = await dialog.showSaveDialog(dialogOptions);
           const {filePath}  = result; 
           fs.writeFile(filePath, data, function (err) {
               if(err){
                   console.log("error: "+err.message);
                   return;
               }
               setPathFileSaved(filePath); //guardar ubicacion de descarga
               console.log("guardado");
           });
   } catch (err) {
       console.log('Save failed:' + err)
   }
}


//-------------------- SAVE HTML WITH TEMPLATE-----------------------//
saveHtmlTemplate.addEventListener("click", async() => {  

    //creo datos a guardar
    var dataToRender = htmlView.innerHTML;  //save document html to save
    const dialogOptions = {
        filters: [{
            name: 'HTML (.html)',
            extensions: ['html']
        }] 
    };
    //preguntar donde quiere guardar y obtener el nombre:
    try{
        const result = await dialog.showSaveDialog(dialogOptions);
        if (result !== undefined && result.filePath[0] !== undefined){
            const {filePath}  = result;    

            var path_of_template = path.join(__dirname, 'app/resources/template.ejs'); //template path
            renderHTMLwithTemplate(path_of_template, dataToRender, filePath); //render and save

        } else return;
    }catch (err) {
        console.log('Save failed:' + err)
    }
});

//--------------- Functions to render with template ----------------//
function renderHTMLwithTemplate(path_of_template, dataToRender, filePath ){
    var extension = path.extname(filePath);
    var filename = path.basename(filePath,extension);
    var data = {valueToRender : dataToRender, title : filename }; //valor para colocar dentro de template.ejs
    let options = {root: __dirname};
    try{
        ejs.renderFile(path_of_template, data, options, function (err, str) {
        if (err) {
            console.log(err);
        }
        saveFileRender(str, filePath); //save into files
        });
    }catch (err) {
        console.log('Save failed:' + err);
    }
}

function saveFileRender(str, filePath ){
    fs.writeFile(filePath, str, function (err) { //save file 
        (err) ? alert("error: " + err.message) : console.log("Archivo guardado!");
    });
    setPathFileSaved(filePath); //guardar ubicacion de descarga
    //style files   
    copyStylesDirectory(filePath);   
}

function copyStylesDirectory(filePath){
    var pathSource = path.join(__dirname, 'app/resources/styles');

    var nameFileDirectory = path.dirname(filePath); //directorio del archivo destino    
    var pathDestination = path.join(nameFileDirectory, "styles"); //se creará la carpeta style en el destino  
    // if folder doesn't exists create it
    if (!fs.existsSync(pathDestination)){
    fs.mkdirSync(pathDestination, { recursive: true });
    }

    fse.copy(pathSource, pathDestination, function (err) {
        (err) ? console.error("error copy directory:"+ err) : console.log("success copy directory!");
    });
}

//--------------- End of Functions to render with template ----------------//


newFileButton.addEventListener("click", () => {     
    markdownView.value = "";
    htmlView.innerHTML = "";
});    


//copy file styles_template.css from app/resourses 
function copyFileStyle(filePath) { //no used
    var path_of_style = path.join(__dirname, 'app/resources/styles_template.css');
    var nameFileDirectory = path.dirname(filePath); //directorio del archivo destino

    var destination = path.join(nameFileDirectory, "styles_template.css");
    fs.copyFile(path_of_style, destination , (err) => { //copy only one file
               if (err) throw err; });       
}