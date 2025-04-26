// src/components/StaffList.tsx
import type { StaffMember } from "../types";
import StaffListItem from "./StaffListItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface StaffListProps {
  staffList: StaffMember[];
  onDeleteStaff: (id: string) => void;
  onReorderStaff: (orderedList: StaffMember[]) => void;
}

function StaffList({
  staffList,
  onDeleteStaff,
  onReorderStaff,
}: StaffListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = staffList.findIndex((staff) => staff.id === active.id);
      const newIndex = staffList.findIndex((staff) => staff.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedList = arrayMove(staffList, oldIndex, newIndex);
        onReorderStaff(reorderedList);
      }
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">
        Staff List (Drag to reorder priority):
      </h3>
      {staffList.length === 0 ? (
        <p className="text-sm text-gray-500">No staff added yet.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={staffList.map((staff) => staff.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {staffList.map((staff) => (
                <StaffListItem
                  key={staff.id}
                  staff={staff}
                  onDeleteStaff={onDeleteStaff}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export default StaffList;
