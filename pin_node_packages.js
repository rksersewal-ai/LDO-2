const fs = require('fs');
const path = require('path');

function findPackageJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules') continue;
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findPackageJsonFiles(filePath, fileList);
        } else if (file === 'package.json') {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const files = findPackageJsonFiles('.');

files.forEach(file => {
    let changed = false;
    const content = fs.readFileSync(file, 'utf8');
    const pkg = JSON.parse(content);

    ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
        if (pkg[depType]) {
            for (const [name, version] of Object.entries(pkg[depType])) {
                if (version.startsWith('^') || version.startsWith('~')) {
                    pkg[depType][name] = version.substring(1);
                    changed = true;
                }
            }
        }
    });

    if (changed) {
        fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
        console.log(`Pinned versions in ${file}`);
    }
});
