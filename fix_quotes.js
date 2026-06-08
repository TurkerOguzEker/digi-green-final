const fs = require('fs');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace all instances of \' with ' and use "" for the strings
    // But since it's simpler, let's just do a blanket regex to replace the backslashes that shouldn't be there
    content = content.replace(/\\'/g, "'");
    fs.writeFileSync(filePath, content, 'utf8');
}

fixFile('src/app/activities/ActivitiesClient.js');
fixFile('src/app/partners/page.js');
console.log('Fixed quotes');
