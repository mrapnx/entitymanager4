
import React, { useState, useEffect } from 'react';
import { Entity, EntityType, AttributeType } from '../types.ts';

interface EntityModalProps {
  types: EntityType[];
  entities: Entity[];
  entity: Entity | null;
  onClose: () => void;
  onSave: (entity: Entity) => void;
}

const EntityModal: React.FC<EntityModalProps> = ({ types, entities, entity, onClose, onSave }) => {
  const [typeId, setTypeId] = useState<string>(entity?.typeId || types[0]?.id || '');
  const [values, setValues] = useState<Record<string, string | number>>(entity?.values || {});

  const selectedType = types.find(t => t.id === typeId);

  useEffect(() => {
    if (!entity) {
      setValues({});
    }
  }, [typeId, entity]);

  const handleSave = () => {
    if (!typeId) return;
    onSave({
      id: entity?.id || 'e' + Date.now(),
      typeId,
      values
    });
  };

  const getEntityDisplayTitle = (e: Entity) => {
    const type = types.find(t => t.id === e.typeId);
    if (!type) return e.id;
    const firstAttr = type.attributes[0];
    return firstAttr ? String(e.values[firstAttr.id] || 'Unbenannt') : e.id;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">
                {entity ? 'Entität bearbeiten' : 'Neue Entität erstellen'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times text-xl"></i>
            </button>
        </div>
        
        <div className="px-8 py-6 space-y-6 overflow-y-auto">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Typ auswählen</label>
                <select 
                    value={typeId} 
                    onChange={(e) => setTypeId(e.target.value)}
                    disabled={!!entity}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 font-medium"
                >
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>

            <div className="space-y-5">
                {selectedType?.attributes.map(attr => (
                    <div key={attr.id} className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{attr.name}</label>
                        {attr.type === AttributeType.LINK ? (
                            <select 
                                value={values[attr.id] || ''}
                                onChange={(e) => setValues({...values, [attr.id]: e.target.value})}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Verknüpfung wählen...</option>
                                {entities
                                  .filter(e => e.typeId === attr.targetTypeId)
                                  .map(targetE => (
                                    <option key={targetE.id} value={targetE.id}>
                                        {getEntityDisplayTitle(targetE)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input 
                                type={attr.type === AttributeType.INT || attr.type === AttributeType.DECIMAL ? 'number' : 'text'}
                                step={attr.type === AttributeType.DECIMAL ? '0.01' : '1'}
                                value={values[attr.id] || ''}
                                onChange={(e) => {
                                    const val = (attr.type === AttributeType.INT || attr.type === AttributeType.DECIMAL) 
                                        ? (e.target.value === '' ? '' : Number(e.target.value))
                                        : e.target.value;
                                    setValues({...values, [attr.id]: val});
                                }}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={`${attr.name} eingeben...`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-4 justify-end">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">
                Abbrechen
            </button>
            <button onClick={handleSave} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">
                Speichern
            </button>
        </div>
      </div>
    </div>
  );
};

export default EntityModal;
