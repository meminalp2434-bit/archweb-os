const AdmZip = require('adm-zip');
const fs = require('fs');

const zip = new AdmZip();
zip.addLocalFolder('./src', 'src');
zip.addLocalFile('./package.json');
zip.addLocalFile('./vite.config.ts');
zip.addLocalFile('./index.html');
if (fs.existsSync('./tsconfig.json')) zip.addLocalFile('./tsconfig.json');
if (fs.existsSync('./tailwind.config.js')) zip.addLocalFile('./tailwind.config.js');

zip.writeZip('./public/kaynak_kodlari.zip');
console.log('Zip file created successfully!');
