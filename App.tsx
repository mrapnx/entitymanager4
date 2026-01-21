
import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, AppData, EntityType, Entity, AttributeType } from './types';
import { XMLService } from './services/xmlService';
import Sidebar from './components/Sidebar';
import EntityCards from './components/EntityCards';
import EntityTable from './components/EntityTable';
import Mindmap from './components/Mindmap';
import TypeEditor from './components/TypeEditor';
import EntityModal from './components/EntityModal';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>({ types: [], entities: [] });
  const [activeView, setActiveView] = useState<ViewType>('cards');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initLoad = async () => {
      const savedData = await XMLService.load();
      if (savedData.types.length === 0) {
        const mockType: EntityType = {
          id: 't1',
          name: 'Aufgabe',
          attributes: [
            { id: 'a1', name: 'Titel', type: AttributeType.TEXT },
            { id: 'a2', name: 'Priorität', type: AttributeType.INT },
            { id: 'a3', name: 'Status', type: AttributeType.TEXT }
          ]
        };
        const mockEntity: Entity = {
          id: 'e1',
          typeId: 't1',
          values: { 'a1': 'Backend integrieren', 'a2': 1, 'a3': 'In Arbeit' }
        };
        const initial = { types: [mockType], entities: [mockEntity] };
        setData(initial);
        await XMLService.save(initial);
      } else {
        setData(savedData);
      }
      setIsLoading(false);
    };
    initLoad();
  }, []);

  const persist = useCallback(async (newData: AppData) => {
    setData(newData);
    await XMLService.save(newData);
  }, []);

  const handleUpdateTypes = (types: EntityType[]) => {
    persist({ ...data, types });
  };

  const handleUpsertEntity = (entity: Entity) => {
    const exists = data.entities.find(e => e.id === entity.id);
    const newEntities = exists 
      ? data.entities.map(e => e.id === entity.id ? entity : e)
      : [...data.entities, entity];
    persist({ ...data, entities: newEntities });
    setIsEntityModalOpen(false);
  };

  const handleDeleteEntity = (id: string) => {
    if (confirm('Möchten Sie diese Entität wirklich löschen?')) {
      const newEntities = data.entities.filter(e => e.id !== id);
      persist({ ...data, entities: newEntities });
    }
  };

  const openEditModal = (entity: Entity) => {
    setSelectedEntity(entity);
    setIsEntityModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedEntity(null);
    setIsEntityModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Lade Daten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
          <h1 className="text-xl font-bold text-slate-800">
            {activeView === 'cards' && 'Kartenansicht'}
            {activeView === 'table' && 'Tabellenansicht'}
            {activeView === 'mindmap' && 'Mindmap'}
            {activeView === 'settings' && 'Typen verwalten'}
          </h1>
          <div className="flex gap-3">
            {activeView !== 'settings' && data.types.length > 0 && (
              <button 
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Neu
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative">
          {activeView === 'cards' && <EntityCards data={data} onEdit={openEditModal} onDelete={handleDeleteEntity} />}
          {activeView === 'table' && <EntityTable data={data} onUpdateEntity={handleUpsertEntity} onDeleteEntity={handleDeleteEntity} />}
          {activeView === 'mindmap' && <Mindmap data={data} onEdit={openEditModal} onDelete={handleDeleteEntity} />}
          {activeView === 'settings' && <TypeEditor types={data.types} onUpdateTypes={handleUpdateTypes} />}
        </div>
      </main>

      {isEntityModalOpen && (
        <EntityModal 
          types={data.types}
          entities={data.entities}
          entity={selectedEntity}
          onClose={() => setIsEntityModalOpen(false)}
          onSave={handleUpsertEntity}
        />
      )}
    </div>
  );
};

export default App;
