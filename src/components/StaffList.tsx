// src/components/StaffList.tsx
import type { StaffMember } from "../types";
import StaffListItem from "./StaffListItem";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      const oldIndex = staffList.findIndex((staff) => staff.id === active.id);
      const newIndex = staffList.findIndex((staff) => staff.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderStaff(arrayMove(staffList, oldIndex, newIndex));
      }
    }
  };

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-slate-600 pt-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-slate-100">
        {t('staff.staffList', { count: staffList.length })}
        <span className="text-sm font-normal text-gray-500 dark:text-slate-400 ml-2">
          {t('staff.dragHandleInstructions')}
        </span>
      </h3>
      {staffList.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-slate-400 italic">
          {t('staff.noStaffAdded')}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flow-root">
            <ul role="list" className="space-y-2">
              <SortableContext
                items={staffList.map((staff) => staff.id)}
                strategy={verticalListSortingStrategy}
              >
                {staffList.map((staff) => (
                  <StaffListItem
                    key={staff.id}
                    staff={staff}
                    onDeleteStaff={onDeleteStaff}
                  />
                ))}
              </SortableContext>
            </ul>
          </div>
        </DndContext>
      )}
    </div>
  );
}

export default StaffList;
