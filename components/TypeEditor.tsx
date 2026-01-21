
import React, { useState } from 'react';
import { EntityType, Attribute, AttributeType } from '../types.ts';

interface TypeEditorProps {
  types: EntityType[];
  onUpdateTypes: (types: EntityType[]) => void;
}

const TypeEditor: React.FC<TypeEditorProps> = ({ types, onUpdateTypes }) => {
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);

  const handleAddType = () => {
    const newType: EntityType = {
        id: 't' + Date.now(),
        name: 'Neuer Typ',
        attributes: [{ id: 'a' + Date.now(), name: 'Titel', type: AttributeType.TEXT }]
    };
    onUpdateTypes([...types, newType]);
    setEditingTypeId(newType.id);
  };

  const handleUpdateType = (id: string, updates: Partial<EntityType>) => {
    onUpdateTypes(types.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteType = (id: string) => {
    if (confirm('Möchten Sie diesen Typen und alle zugehörigen Daten wirklich löschen?')) {
        onUpdateTypes(types.filter(t => t.id !== id));
    }
  };

  const handleAddAttribute = (typeId: string) => {
    const type = types.find(t => t.id === typeId);
    if (!type) return;
    const newAttr: Attribute = { id: 'a' + Date.now(), name: 'Neues Attribut', type: AttributeType.TEXT };
    handleUpdateType(typeId, { attributes: [...type.attributes, newAttr] });
  };

  const handleUpdateAttribute = (typeId: string, attrId: string, updates: Partial<Attribute>) => {
    const type = types.find(t => t.id === typeId);
    if (!type) return;
    handleUpdateType(typeId, {
        attributes: type.attributes.map(a => a.id === attrId ? { ...a, ...updates } : a)
    });
  };

  const handleDeleteAttribute = (typeId: string, attrId: string) => {
    const type = types.find(t => t.id === typeId);
    if (!type) return;
    handleUpdateType(typeId, {
        attributes: type.attributes.filter(a => a.id !== attrId)
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Definition der Datenstruktur</h2>
        <button 
          onClick={handleAddType}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Neuer Typ
        </button>
      </div>

      <div className="space-y-4">
        {types.map(type => (
            <div key={type.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-200">
                    <div className="flex items-center gap-4 flex-1">
                        <input 
                            value={type.name}
                            onChange={(e) => handleUpdateType(type.id, { name: e.target.value })}
                            className="bg-transparent font-bold text-slate-700 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-xs text-slate-400 font-mono">ID: {type.id}</span>
                    </div>
                    <button onClick={() => handleDeleteType(type.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <i className="fas fa-trash-alt"></i>
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-4">Name</div>
                        <div className="col-span-3">Datentyp</div>
                        <div className="col-span-4">Zieltyp (Links)</div>
                        <div className="col-span-1"></div>
                    </div>
                    
                    {type.attributes.map(attr => (
                        <div key={attr.id} className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-4">
                                <input 
                                    value={attr.name}
                                    onChange={(e) => handleUpdateAttribute(type.id, attr.id, { name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="col-span-3">
                                <select 
                                    value={attr.type}
                                    onChange={(e) => handleUpdateAttribute(type.id, attr.id, { type: e.target.value as AttributeType })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value={AttributeType.TEXT}>Text</option>
                                    <option value={AttributeType.INT}>Ganzzahl (INT)</option>
                                    <option value={AttributeType.DECIMAL}>Dezimal (DEC)</option>
                                    <option value={AttributeType.LINK}>Link</option>
                                </select>
                            </div>
                            <div className="col-span-4">
                                {attr.type === AttributeType.LINK && (
                                    <select 
                                        value={attr.targetTypeId || ''}
                                        onChange={(e) => handleUpdateAttribute(type.id, attr.id, { targetTypeId: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Ziel wählen...</option>
                                        {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                )}
                            </div>
                            <div className="col-span-1 text-right">
                                <button onClick={() => handleDeleteAttribute(type.id, attr.id)} className="text-slate-300 hover:text-red-500">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    <button 
                        onClick={() => handleAddAttribute(type.id)}
                        className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-2 mt-4"
                    >
                        <i className="fas fa-plus-circle"></i> Attribut hinzufügen
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default TypeEditor;
