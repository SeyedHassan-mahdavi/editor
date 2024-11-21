'use client';

import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const CARD_TYPE = 'CARD';

function Card({ card, columnId, index, openCardModal, moveCard }) {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: CARD_TYPE,
    item: { id: card.id, index, columnId, type: CARD_TYPE },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: CARD_TYPE,
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      const sourceColumnId = item.columnId;

      if (dragIndex === hoverIndex && sourceColumnId === columnId) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveCard(dragIndex, hoverIndex, sourceColumnId, columnId);

      item.index = hoverIndex;
      item.columnId = columnId;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(drop(ref));

  const opacity = isDragging ? 0.5 : 1;
  const backgroundColor = isOver && canDrop ? 'bg-green-200' : 'bg-white';

  return (
    <div
      ref={ref}
      style={{ opacity }}
      className={`p-4 mb-2 border rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${backgroundColor}`}
      onClick={() => openCardModal(card)}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">{card.title}</span>
      </div>
    </div>
  );
}

export default Card;
