'use client';

import { useState } from 'react';
import Column from '../../components/event/Column';
import Modal from '../../components/event/Modal';

function KanbanBoard() {
  const [columns, setColumns] = useState([
    { id: '1', title: 'To Do', cards: [] },
    { id: '2', title: 'In Progress', cards: [] },
    { id: '3', title: 'Done', cards: [] },
  ]);

  const [currentCard, setCurrentCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [addingCard, setAddingCard] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [addingColumn, setAddingColumn] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState('');

  const handleAddCardClick = (columnId) => {
    setAddingCard(columnId);
  };

  const handleAddCardSubmit = (columnId) => {
    if (newCardTitle.trim()) {
      setColumns(columns.map(column => 
        column.id === columnId 
          ? { ...column, cards: [...column.cards, { id: Date.now(), title: newCardTitle, description: '', dueDate: '', status: column.title, assignedMembers: [] }] } 
          : column
      ));
      setNewCardTitle('');
      setAddingCard(null);
    }
  };

  const handleAddColumnClick = () => {
    setAddingColumn(true);
  };

  const handleAddColumnSubmit = () => {
    if (newColumnTitle.trim()) {
      const newColumn = { id: Date.now().toString(), title: newColumnTitle, cards: [] };
      setColumns([...columns, newColumn]);
      setNewColumnTitle('');
      setAddingColumn(false);
    }
  };

  const openCardModal = (card) => {
    setCurrentCard(card);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentCard(null);
  };

  const updateCardDetails = (field, value) => {
    const updatedCard = { ...currentCard, [field]: value };
    const currentColumn = columns.find(column => column.title === currentCard.status);
    const newColumn = columns.find(column => column.title === updatedCard.status);

    if (currentColumn && newColumn && currentColumn.id !== newColumn.id) {
      // Move card to the new column
      currentColumn.cards = currentColumn.cards.filter(card => card.id !== updatedCard.id);
      newColumn.cards.push(updatedCard);
    } else {
      // Update card within the same column
      currentColumn.cards = currentColumn.cards.map(card =>
        card.id === updatedCard.id ? updatedCard : card
      );
    }

    setColumns([...columns]);
    setCurrentCard(updatedCard);
  };

  const handleEditColumnTitle = (column) => {
    setEditingColumnId(column.id);
    setEditingColumnTitle(column.title);
  };

  const handleUpdateColumnTitle = (columnId) => {
    setColumns(columns.map(column => 
      column.id === columnId 
        ? { ...column, title: editingColumnTitle } 
        : column
    ));
    setEditingColumnId(null);
    setEditingColumnTitle('');
  };

  const moveColumn = (dragIndex, hoverIndex) => {
    const newColumns = [...columns];
    const [draggedColumn] = newColumns.splice(dragIndex, 1);
    newColumns.splice(hoverIndex, 0, draggedColumn);
    setColumns(newColumns);
  };

  const moveCard = (sourceIndex, destIndex, sourceColumnId, destColumnId) => {
    const sourceColumn = columns.find(column => column.id === sourceColumnId);
    const destColumn = columns.find(column => column.id === destColumnId);
    const [movedCard] = sourceColumn.cards.splice(sourceIndex, 1);
    movedCard.status = destColumn.title;
    destColumn.cards.splice(destIndex, 0, movedCard);
    setColumns([...columns]);
  };

  return (
    <div className="flex overflow-x-auto p-4 bg-blue-600 min-h-screen mb-24">
      {columns.map((column, index) => (
        <Column
          key={column.id}
          index={index}
          column={column}
          moveColumn={moveColumn}
          moveCard={moveCard}
          handleEditColumnTitle={handleEditColumnTitle}
          handleUpdateColumnTitle={handleUpdateColumnTitle}
          editingColumnId={editingColumnId}
          editingColumnTitle={editingColumnTitle}
          setEditingColumnTitle={setEditingColumnTitle}
          openCardModal={openCardModal}
          addingCard={addingCard}
          setAddingCard={setAddingCard}
          handleAddCardClick={handleAddCardClick}
          handleAddCardSubmit={handleAddCardSubmit}
          newCardTitle={newCardTitle}
          setNewCardTitle={setNewCardTitle}
        />
      ))}

      {addingColumn ? (
        <div className="flex flex-col w-80 mx-2 bg-white rounded-lg shadow-lg flex-shrink-0 p-4">
          <input 
            type="text" 
            value={newColumnTitle} 
            onChange={(e) => setNewColumnTitle(e.target.value)} 
            placeholder="Enter list title"
            className="w-full p-2 border rounded mb-2"
          />
          <button 
            onClick={handleAddColumnSubmit} 
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
          >
            Add List
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-80 mx-2 bg-blue-500 text-white rounded-lg shadow-lg flex-shrink-0 cursor-pointer" onClick={handleAddColumnClick}>
          <div className="p-4 text-lg">
            + Add another list
          </div>
        </div>
      )}

      {showModal && currentCard && (
        <Modal
          card={currentCard}
          columns={columns}
          updateCardDetails={updateCardDetails}
          closeModal={closeModal}
        />
      )}
    </div>
  );
}

export default KanbanBoard;
