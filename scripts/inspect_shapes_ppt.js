const AdmZip = require('adm-zip');
const zip = new AdmZip('PPT_Sample.pptx');

[10, 11, 12].forEach(n => {
  const xml = zip.readAsText('ppt/slides/slide' + n + '.xml');
  const codeSp = xml.match(/<p:sp>[\s\S]*?txBox="1"[\s\S]*?<\/p:sp>/);
  if (codeSp) {
    console.log(`Slide ${n} code shape start:`, codeSp[0].substring(0, 300));
    console.log(`Slide ${n} code shape end:`, codeSp[0].substring(codeSp[0].length - 150));
  }
});

