
import { AppData, EntityType, Entity, AttributeType } from '../types.ts';

export const XMLService = {
  save: async (data: AppData): Promise<void> => {
    const xmlString = XMLService.toXML(data);
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xml: xmlString })
      });
      if (!response.ok) throw new Error('Save failed');
      console.log('Data saved to server as XML');
    } catch (err) {
      console.error('Persistence error:', err);
    }
  },

  load: async (): Promise<AppData> => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) return { types: [], entities: [] };
      const xmlString = await response.text();
      return XMLService.fromXML(xmlString);
    } catch (err) {
      console.error('Load error:', err);
      return { types: [], entities: [] };
    }
  },

  toXML: (data: AppData): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<DataManager>\n';
    xml += '  <Types>\n';
    data.types.forEach(t => {
      xml += `    <Type id="${t.id}" name="${t.name}">\n`;
      t.attributes.forEach(a => {
        xml += `      <Attribute id="${a.id}" name="${a.name}" type="${a.type}"${a.targetTypeId ? ` target="${a.targetTypeId}"` : ''} />\n`;
      });
      xml += '    </Type>\n';
    });
    xml += '  </Types>\n';
    xml += '  <Entities>\n';
    data.entities.forEach(e => {
      xml += `    <Entity id="${e.id}" typeId="${e.typeId}">\n`;
      Object.entries(e.values).forEach(([attrId, value]) => {
        xml += `      <Value attrId="${attrId}">${value}</Value>\n`;
      });
      xml += '    </Entity>\n';
    });
    xml += '  </Entities>\n';
    xml += '</DataManager>';
    return xml;
  },

  fromXML: (xmlString: string): AppData => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const types: EntityType[] = [];
    const entities: Entity[] = [];

    const typeNodes = xmlDoc.getElementsByTagName("Type");
    for (let i = 0; i < typeNodes.length; i++) {
      const tNode = typeNodes[i];
      const attributes = [];
      const attrNodes = tNode.getElementsByTagName("Attribute");
      for (let j = 0; j < attrNodes.length; j++) {
        attributes.push({
          id: attrNodes[j].getAttribute("id") || "",
          name: attrNodes[j].getAttribute("name") || "",
          type: (attrNodes[j].getAttribute("type") as AttributeType) || AttributeType.TEXT,
          targetTypeId: attrNodes[j].getAttribute("target") || undefined
        });
      }
      types.push({
        id: tNode.getAttribute("id") || "",
        name: tNode.getAttribute("name") || "",
        attributes
      });
    }

    const entityNodes = xmlDoc.getElementsByTagName("Entity");
    for (let i = 0; i < entityNodes.length; i++) {
      const eNode = entityNodes[i];
      const values: Record<string, string | number> = {};
      const valueNodes = eNode.getElementsByTagName("Value");
      for (let j = 0; j < valueNodes.length; j++) {
        const vNode = valueNodes[j];
        const attrId = vNode.getAttribute("attrId") || "";
        const val = vNode.textContent || "";
        const numValue = Number(val);
        values[attrId] = (isNaN(numValue) || val === "") ? val : numValue;
      }
      entities.push({
        id: eNode.getAttribute("id") || "",
        typeId: eNode.getAttribute("typeId") || "",
        values
      });
    }
    return { types, entities };
  }
};
