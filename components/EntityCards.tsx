
import React, { useMemo } from 'react';
import { AppData, Entity, AttributeType } from '../types';

interface EntityCardsProps {
  data: AppData;
  onEdit: (entity: Entity) => void;
  onDelete: (id: string) => void;
}

const EntityCards: React.FC<EntityCardsProps> = ({ data, onEdit, onDelete }) => {
  const { types, entities } = data;

  const getBacklinks = (entityId: string) => {
    return entities.filter(e => {
      const type = types.find(t => t.id === e.typeId);
      if (!type) return false;
      return type.attributes.some(attr => 
        attr.type === AttributeType.LINK && e.values[attr.id] === entityId
      );
    });
  };

  const getEntityTitle = (entity: Entity) => {
    const type = types.find(t => t.id === entity.typeId);
    if (!type) return entity.id;
    const firstAttr = type.attributes[0];
    return firstAttr ? String(entity.values[firstAttr.id] || 'Unbenannt') : 'Unbenannt';
  };

  if (entities.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <i className="fas fa-box-open text-5xl mb-4"></i>
              <p>Keine Entitäten vorhanden.</p>
          </div>
      );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {entities.map(entity => {
        const type = types.find(t => t.id === entity.typeId);
        const backlinks = getBacklinks(entity.id);
        
        return (
          <div key={entity.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{type?.name || 'Unbekannt'}</span>
              <div className="flex gap-2">
                <button onClick={() => onEdit(entity)} className="text-slate-400 hover:text-blue-600 transition-colors p-1">
                  <i className="fas fa-edit text-sm"></i>
                </button>
                <button onClick={() => onDelete(entity.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1">
                  <i className="fas fa-trash text-sm"></i>
                </button>
              </div>
            </div>
            
            <div className="p-5 flex-1">
              <h3 className="font-bold text-lg text-slate-800 mb-4">{getEntityTitle(entity)}</h3>
              
              <div className="space-y-3">
                {type?.attributes.slice(1).map(attr => (
                  <div key={attr.id}>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">{attr.name}</label>
                    <div className="text-sm text-slate-600">
                        {attr.type === AttributeType.LINK ? (
                            <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                                <i className="fas fa-link text-xs"></i>
                                {entities.find(e => e.id === entity.values[attr.id]) ? getEntityTitle(entities.find(e => e.id === entity.values[attr.id])!) : 'Leer'}
                            </span>
                        ) : (
                            entity.values[attr.id] || '-'
                        )}
                    </div>
                  </div>
                ))}
              </div>

              {backlinks.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-2">Backlinks</label>
                    <div className="flex flex-wrap gap-2">
                        {backlinks.map(bl => (
                            <span key={bl.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">
                                {getEntityTitle(bl)}
                            </span>
                        ))}
                    </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EntityCards;
