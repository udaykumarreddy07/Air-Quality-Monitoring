const AdmZip = require('adm-zip');
const zip = new AdmZip('PPT_Sample.pptx');

[10, 11, 12].forEach(n => {
  const xml = zip.readAsText('ppt/slides/slide' + n + '.xml');
  const shapes = xml.match(/<p:sp>[\s\S]*?<\/p:sp>/g) || [];
  shapes.forEach((sp, i) => {
    if (sp.includes('name="TextBox 6"')) {
      console.log(`Slide ${n} Shape ${i} is TextBox 6! Length: ${sp.length}`);
    }
  });
});

