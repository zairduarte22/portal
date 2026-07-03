const fs = require('fs');
const path = require('path');

const dir = 'c:/proyectos/fondo2/portal/resources/js/app/components';
const getFiles = (d) => {
    let results = [];
    const list = fs.readdirSync(d);
    list.forEach(file => {
        file = path.join(d, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(getFiles(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = getFiles(dir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix new Date(x.fecha) -> new Date(x.fecha + 'T12:00:00Z')
    // Regex for new Date(var.fecha) or similar
    const regex = /new Date\(([\w\.\?]+(?:fecha|fecha_vencimiento|fecha_emision|fecha_ingreso|mes_cuota|fecha_limite|fecha_nacimiento|ultimo_mes))\)/g;
    content = content.replace(regex, (match, p1) => {
        return 'new Date(' + p1 + ' + "T12:00:00Z")';
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});
