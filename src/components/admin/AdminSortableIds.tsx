import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

type AdminSortableIdsProps<T extends { id: string }> = {
  items: T[];
  onReorder: (items: T[]) => void;
  renderPlate: (item: T, index: number) => ReactNode;
  className?: string;
};

function SortableRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <li className="list-none" ref={setNodeRef} style={style} {...attributes} data-testid={`sort-row-${id}`}>
      <div className="flex min-h-11 items-stretch gap-0">
        <button
          type="button"
          data-testid={`drag-handle-${id}`}
          className="shrink-0 cursor-grab border border-[var(--border-cyan)] px-2 font-mono text-[10px] text-[var(--text-muted)] active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...listeners}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </li>
  );
}

export default function AdminSortableIds<T extends { id: string }>({
  items,
  onReorder,
  renderPlate,
  className = 'flex flex-col gap-2',
}: AdminSortableIdsProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className={className}>
          {items.map((item, index) => (
            <SortableRow key={item.id} id={item.id}>
              {renderPlate(item, index)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}