const fs = require('fs');

let content = fs.readFileSync('PROJECT_REPORT.md', 'utf8');

content = content.replace(/# AIRWATCH/g, '# Air Quality Monitoring');
content = content.replace(/“AIRWATCH –/g, '“Air Quality Monitoring –');
content = content.replace(/\*\*AIRWATCH\*\*/g, '**Air Quality Monitoring**');
content = content.replace(/In AIRWATCH,/g, 'In Air Quality Monitoring,');
content = content.replace(/for AIRWATCH is/g, 'for Air Quality Monitoring is');
content = content.replace(/AIRWATCH synthesizes/g, 'Air Quality Monitoring synthesizes');
content = content.replace(/AIRWATCH project/g, 'Air Quality Monitoring project');
content = content.replace(/AIRWATCH is an/g, 'Air Quality Monitoring is an');
content = content.replace(/AIRWATCH co-presents/g, 'Air Quality Monitoring co-presents');
content = content.replace(/AIRWATCH bridges/g, 'Air Quality Monitoring bridges');
content = content.replace(/foundation of AIRWATCH/g, 'foundation of Air Quality Monitoring');
content = content.replace(/AIRWATCH utilizes/g, 'Air Quality Monitoring utilizes');
content = content.replace(/initialization, AIRWATCH/g, 'initialization, Air Quality Monitoring');
content = content.replace(/AIRWATCH serves/g, 'Air Quality Monitoring serves');
content = content.replace(/for the AIRWATCH/g, 'for the Air Quality Monitoring');

fs.writeFileSync('PROJECT_REPORT.md', content, 'utf8');
console.log('PROJECT_REPORT.md updated successfully.');

