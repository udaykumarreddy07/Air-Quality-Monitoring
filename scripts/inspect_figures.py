import zipfile, xml.etree.ElementTree as ET

with zipfile.ZipFile('AIRWATCH report.docx', 'r') as z:
    rels_xml = z.read('word/_rels/document.xml.rels')
    rels_tree = ET.fromstring(rels_xml)
    rel_map = {}
    for rel in rels_tree:
        rid = rel.attrib.get('Id')
        target = rel.attrib.get('Target')
        if target and 'media' in target:
            rel_map[rid] = target

    doc_xml = z.read('word/document.xml')
    tree = ET.fromstring(doc_xml)
    
    for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        p_text = ''.join(node.text for node in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text).strip()
        blips = p.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
        if blips:
            for b in blips:
                embed = b.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
                print(f'Text: "{p_text[:60]}" -> Image: {rel_map.get(embed)}')
        elif 'Figure' in p_text or 'Table' in p_text:
            print(f'Caption: "{p_text}"')

