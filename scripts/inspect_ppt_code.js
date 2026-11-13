const AdmZip = require('adm-zip');
const zip = new AdmZip('Air_Quality_Monitoring_Presentation.pptx');

[10, 11, 12].forEach(num => {
  const s = zip.readAsText('ppt/slides/slide' + num + '.xml');
  const shapes = s.match(/<p:sp>[\s\S]*?<\/p:sp>/g) || [];
  shapes.forEach((sp, i) => {
    if (sp.includes('DOCTYPE') || sp.includes('update') || sp.includes('drawChart')) {
      const ps = sp.match(/<a:p[\s\S]*?<\/a:p>/g) || [];
      console.log(`=== SLIDE ${num} SHAPE ${i} (${ps.length} lines) ===`);
      ps.forEach((p, lineIdx) => {
        const txt = (p.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g) || []).map(t => t.replace(/<[^>]+>/g, '')).join('');
        console.log(`${lineIdx + 1}: ${txt}`);
      });
    }
  });
});

