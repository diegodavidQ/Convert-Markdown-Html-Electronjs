// All of the Node.js APIs are available in the preload process.
const marked = require('electron').remote.require('marked'); 
const fs =  require('electron').remote.require('fs'); 
const { dialog } = require('electron').remote;
const path = require('electron').remote.require('path');
const ejs = require('electron').remote.require('ejs');
const createDOMPurify = require('electron').remote.require('dompurify');
const {JSDOM} = require('electron').remote.require('jsdom');
const {shell} = require('electron').remote;
const fse =  require('electron').remote.require('fs-extra');  //para copiar directorio
//#####################################//

//funciones usadas en renderer.js
window.marked = function(markdown){  //convert markdown to html
  return marked(markdown);
}

window.createDOMPurify = function(dirty){ //clean html
  const window1 = new JSDOM('').window;
  const DOMPurify = createDOMPurify(window1); 
  const clean = DOMPurify.sanitize(dirty);
  return clean;
}

//dialog
window.electron = {};
window.electron.dialog = dialog;
//fs
window.fs = fs;
//path
window.path = path;
//shell
window.electron.shell = shell;
//ejs
window.ejs = ejs;
//fse
window.fse = fse;

/*

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})*/