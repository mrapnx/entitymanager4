
import React, { useState, useMemo } from 'react';
import { AppData, Entity, EntityType, AttributeType, Attribute } from '../types.ts';

interface EntityTableProps {
  data: AppData;
  onUpdateEntity: (entity: Entity) => void;
  onDeleteEntity: (id: string) => void;
}

const EntityTable: React.FC<EntityTableProps> = ({ data, onUpdateEntity, onDeleteEntity }) => {
  const { types, entities } = data;
  const [selectedTypeId, setSelectedTypeId] = useState<string>(types[0]?.id || '');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [editingCell, setEditingCell] = useState<{ entityId: string, attrId: string } | null>(null);
  const [quickAddValues, setQuickAddValues] = useState<Record<string, string | number>>({});

  const selectedType = types.find(t => t.id === selectedTypeId);
  
  const filteredEntities = useMemo(() => {
    let result = entities.filter(e => e.typeId === selectedTypeId);
    if (sortConfig) {
        result.sort((a, b) => {
            const valA = a.values[sortConfig.key] || '';
            const valB = b.values[sortConfig.key] || '';
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return result;
  }, [entities, selectedTypeId, sortConfig]);

  const handleSort = (attrId: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === attrId && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key: attrId, direction });
  };

  const handleInlineSave = (entity: Entity, attrId: string, value: string | number) => {
    const updated = {
        ...entity,
        values: { ...entity.values, [attrId]: value }
    };
    onUpdateEntity(updated);
    setEditingCell(null);
  };

  const handleQuickAdd = () => {
    if (!selectedTypeId) return;
    const newEntity: Entity = {
        id: 'e' + Date.now(),
        typeId: selectedTypeId,
        values: quickAddValues
    };
    onUpdateEntity(newEntity);
    setQuickAddValues({});
  };

  if (types.length === 0) return <div>Bitte legen Sie zuerst einen Typen an.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-sm font-semibold text-slate-500">Typ wählen:</label>
        <select 
          value={selectedTypeId} 
          onChange={(e) => setSelectedTypeId(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {selectedType?.attributes.map(attr => (
                <th 
                  key={attr.id} 
                  onClick={() => handleSort(attr.id)}
                  className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2">
                    {attr.name}
                    {sortConfig?.key === attr.id && (
                        <i className={`fas fa-sort-amount-${sortConfig.direction === 'asc' ? 'up' : 'down'} text-blue-500`}></i>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-20">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEntities.map(entity => (
              <tr key={entity.id} className="hover:bg-blue-50/30 transition-colors group">
                {selectedType?.attributes.map(attr => {
                  const isEditing = editingCell?.entityId === entity.id && editingCell?.attrId === attr.id;
                  const value = entity.values[attr.id] || '';
                  
                  return (
                    <td 
                      key={attr.id} 
                      className="px-6 py-4 text-sm text-slate-600"
                      onClick={() => setEditingCell({ entityId: entity.id, attrId: attr.id })}
                    >
                      {isEditing ? (
                        attr.type === AttributeType.LINK ? (
                            <select 
                                autoFocus
                                className="w-full bg-white border border-blue-400 rounded px-2 py-1 outline-none"
                                value={value}
                                onBlur={() => setEditingCell(null)}
                                onChange={(e) => handleInlineSave(entity, attr.id, e.target.value)}
                            >
                                <option value="">Verknüpfung wählen...</option>
                                {entities.filter(e => e.typeId === attr.targetTypeId).map(targetE => (
                                    <option key={targetE.id} value={targetE.id}>
                                        {String(targetE.values[Object.keys(targetE.values)[0]] || targetE.id)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input 
                                autoFocus
                                type={attr.type === AttributeType.INT ? 'number' : 'text'}
                                className="w-full bg-white border border-blue-400 rounded px-2 py-1 outline-none"
                                value={value}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(entity, attr.id, (e.target as HTMLInputElement).value)}
                                onChange={(e) => {
                                    // Local state management could be added here for even snappier UI
                                }}
                            />
                        )
                      ) : (
                        <div className="min-h-[1.5rem]">
                            {attr.type === AttributeType.LINK ? (
                                <span className="text-blue-600 font-medium">
                                    {entities.find(e => e.id === value)?.values[Object.keys(entities.find(e => e.id === value)?.values || {})[0]] || '-'}
                                </span>
                            ) : value}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onDeleteEntity(entity.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
            {/* Quick Add Row */}
            <tr className="bg-slate-50/50">
                {selectedType?.attributes.map(attr => (
                    <td key={attr.id} className="px-6 py-4">
                        {attr.type === AttributeType.LINK ? (
                            <select 
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                                value={quickAddValues[attr.id] || ''}
                                onChange={(e) => setQuickAddValues({...quickAddValues, [attr.id]: e.target.value})}
                            >
                                <option value="">Link...</option>
                                {entities.filter(e => e.typeId === attr.targetTypeId).map(targetE => (
                                    <option key={targetE.id} value={targetE.id}>
                                        {String(targetE.values[Object.keys(targetE.values)[0]] || targetE.id)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input 
                                placeholder={`${attr.name}...`}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                                value={quickAddValues[attr.id] || ''}
                                onChange={(e) => setQuickAddValues({...quickAddValues, [attr.id]: e.target.value})}
                            />
                        )}
                    </td>
                ))}
                <td className="px-6 py-4">
                    <button 
                        onClick={handleQuickAdd}
                        disabled={Object.keys(quickAddValues).length === 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded px-2 py-1 text-xs font-bold transition-colors"
                    >
                        ADD
                    </button>
                </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EntityTable;
