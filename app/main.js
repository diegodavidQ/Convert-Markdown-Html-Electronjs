const {app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;

//reload entorno de desarrollo
//options will default to {ignored: /node_modules|[\/\\]\./, argv: []}.
const ignoredNode = /node_modules|[/\\]\./;
const ignored1 = /files|[/\\]\./; //file => files
const ignored2 = /app\/files|[/\\]\./; //file => app/files
const ignored3 = /app\/img|[/\\]\./; //file => app/img

if (process.env.NODE_ENV !== 'production'){
   /* require('electron-reload')(__dirname, {  }) */
    require('electron-reload')(__dirname, {ignored: [ignored1, ignored2, ignored3, ignoredNode] });   
}



app.on('ready', ()=>{
    mainWindow = new BrowserWindow({
        'title':"Markdown to HTML",
        width: 1000,
        'minHeight': 600,
        'minWidth': 900,        
        show: false, //no se muestra el contenido
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }        
    });
    
    mainWindow.setMenu(null);

    mainWindow.loadFile(__dirname + '/index.html'); //cargar el archivo index.html        
    mainWindow.once('ready-to-show', ()=>{  
        //mainWindow.maximize();      
        mainWindow.show(); //una vez que ya este listo para mostrarse el contenido proceda a mostrarse
    });

    mainWindow.setBackgroundColor('#102027');

    mainWindow.on('closed', (e)=> { //cuando la ventana sea cerrada 
        mainWindow = null;      
    }); //end mainWindow.on

})

