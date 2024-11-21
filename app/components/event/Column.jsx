'use client';

import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Card from './Card';
import { FiEdit2 } from 'react-icons/fi';


const COLUMN_TYPE = 'COLUMN';
const CARD_TYPE = 'CARD';

function Column({
  column,
  index,
  moveColumn,
  moveCard,
  handleEditColumnTitle,
  handleUpdateColumnTitle,
  editingColumnId,
  editingColumnTitle,
  setEditingColumnTitle,
  openCardModal,
  addingCard,
  setAddingCard,
  handleAddCardClick,
  handleAddCardSubmit,
  newCardTitle,
  setNewCardTitle,
}) {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: [COLUMN_TYPE, CARD_TYPE],
    hover(item, monitor) {
      if (item.type === COLUMN_TYPE) {
        const dragIndex = item.index;
        const hoverIndex = index;

        if (!ref.current || dragIndex === hoverIndex) return;

        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleX =
          (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientX = clientOffset.x - hoverBoundingRect.left;

        if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
        if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

        moveColumn(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
    drop(item, monitor) {
      if (item.type === CARD_TYPE && monitor.isOver({ shallow: true })) {
        const sourceIndex = item.index;
        const destIndex = column.cards.length;
        const sourceColumnId = item.columnId;
        const destColumnId = column.id;

        if (sourceColumnId === destColumnId) {
          // جابجایی کارت‌ها داخل همان ستون
          moveCard(sourceIndex, destIndex - 1, sourceColumnId, destColumnId);
        } else if (sourceColumnId !== destColumnId) {
          // جابجایی کارت‌ها بین ستون‌ها
          moveCard(sourceIndex, destIndex, sourceColumnId, destColumnId);
        }

        item.columnId = destColumnId;
        item.index = destIndex;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: COLUMN_TYPE,
    item: { index, type: COLUMN_TYPE },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;
  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity }}
      className="flex flex-col w-80 mx-2 bg-white rounded-lg shadow-lg flex-shrink-0"
    >
      <div
        className="flex items-center justify-between p-4 bg-gray-100 rounded-t-lg"
      >
        {editingColumnId === column.id ? (
          <input
            type="text"
            value={editingColumnTitle}
            onChange={(e) => setEditingColumnTitle(e.target.value)}
            onBlur={() => handleUpdateColumnTitle(column.id)}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdateColumnTitle(column.id)}
            className="w-full p-2 border rounded"
          />
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-800">
              {column.title}
            </h2>
            <button
              onClick={() => handleEditColumnTitle(column)}
              className="ml-2 text-gray-600 hover:text-gray-800"
            >
              <FiEdit2 />
            </button>
          </>
        )}
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        {column.cards.map((card, cardIndex) => (
          <Card
            key={card.id}
            card={card}
            columnId={column.id}
            index={cardIndex}
            openCardModal={openCardModal}
            moveCard={moveCard}
          />
        ))}

        {addingCard === column.id && (
          <div className="p-4 m-2 bg-gray-100 rounded-lg shadow-sm">
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter card title"
              className="w-full p-2 border rounded mb-2"
            />
            <button
              onClick={() => handleAddCardSubmit(column.id)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
            >
              Save
            </button>
          </div>
        )}
      </div>
      {addingCard !== column.id && (
        <button
          className="p-4 bg-gray-100 text-gray-700 rounded-b-lg hover:bg-gray-200"
          onClick={() => handleAddCardClick(column.id)}
        >
          + Add a card
        </button>
      )}
    </div>
  );
}

export default Column;
