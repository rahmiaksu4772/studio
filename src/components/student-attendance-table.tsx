import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from '@/components/ui/table';
import type { DailyRecord, Student, AttendanceStatus } from '@/lib/types';
import StudentRow from './student-row';

type StudentAttendanceTableProps = {
  students: Student[];
  records: Record<string, DailyRecord>;
  onRecordChange: (studentId: string, newRecord: Partial<DailyRecord>) => void;
  filter: AttendanceStatus | 'all';
  classId: string;
  recordDate: string;
};

export default function StudentAttendanceTable({
  students,
  records,
  onRecordChange,
  filter,
  classId,
  recordDate
}: StudentAttendanceTableProps) {
  const filteredStudents =
    filter === 'all'
      ? students
      : students.filter((s) => records[s.id]?.status === filter);

  if (filteredStudents.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Bu filtrede öğrenci bulunamadı.
      </div>
    );
  }
      
  return (
    <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">No</TableHead>
              <TableHead>Öğrenci Adı Soyadı</TableHead>
              <TableHead className="min-w-[320px]">Durum</TableHead>
              <TableHead className="w-full">Açıklama</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                record={records[student.id]}
                onRecordChange={onRecordChange}
                classId={classId}
                recordDate={recordDate}
              />
            ))}
          </TableBody>
        </Table>
    </div>
  );
}
