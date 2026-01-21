
import { AppData, EntityType, Entity, AttributeType } from '../types';

const STORAGE_KEY = 'dynamic_entity_manager_v4_xml';

/**
 * Simulates saving data to an XML file. 
 * Actually persists to LocalStorage as an XML string.
 */
export const XMLService = {
  save: (data: AppData): void => {
    const xmlString = XMLService.toXML(data);
    localStorage.setItem(STORAGE_KEY, xmlString);
    console.log('Data saved as XML:', xmlString);
  },

  load: (): AppData => {
    const xmlString = localStorage.getItem(STORAGE_KEY);
    if (!xmlString) return { types: [], entities: [] };
    return XMLService.fromXML(xmlString);
  },

  toXML: (data: AppData): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<DataManager>\n';
    
    // Serialize Types
    xml += '  <Types>\n';
    data.types.forEach(t => {
      xml += `    <Type id="${t.id}" name="${t.name}">\n`;
      t.attributes.forEach(a => {
        xml += `      <Attribute id="${a.id}" name="${a.name}" type="${a.type}"${a.targetTypeId ? ` target="${a.targetTypeId}"` : ''} />\n`;
      });
      xml += '    </Type>\n';
    });
    xml += '  </Types>\n';

    // Serialize Entities
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
      const id = tNode.getAttribute("id") || "";
      const name = tNode.getAttribute("name") || "";
      const attrNodes = tNode.getElementsByTagName("Attribute");
      const attributes = [];
      for (let j = 0; j < attrNodes.length; j++) {
        const aNode = attrNodes[j];
        attributes.push({
          id: aNode.getAttribute("id") || "",
          name: aNode.getAttribute("name") || "",
          type: (aNode.getAttribute("type") as AttributeType) || AttributeType.TEXT,
          targetTypeId: aNode.getAttribute("target") || undefined
        });
      }
      types.push({ id, name, attributes });
    }

    const entityNodes = xmlDoc.getElementsByTagName("Entity");
    for (let i = 0; i < entityNodes.length; i++) {
      const eNode = entityNodes[i];
      const id = eNode.getAttribute("id") || "";
      const typeId = eNode.getAttribute("typeId") || "";
      const valueNodes = eNode.getElementsByTagName("Value");
      const values: Record<string, string | number> = {};
      for (let j = 0; j < valueNodes.length; j++) {
        const vNode = valueNodes[j];
        const attrId = vNode.getAttribute("attrId") || "";
        const value = vNode.textContent || "";
        // Try to parse numbers
        const numValue = Number(value);
        values[attrId] = isNaN(numValue) || value === "" ? value : numValue;
      }
      entities.push({ id, typeId, values });
    }

    return { types, entities };
  }
};
