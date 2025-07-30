import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import type { DailyRecord, Student, AttendanceStatus } from '@/lib/types';
import StudentRow from './student-row';

type StudentAttendanceTableProps = {
  students: Student[];
  records: Record<string, DailyRecord>;
  onRecordChange: (studentId: string, newRecord: Partial<DailyRecord>) => void;
  filter: AttendanceStatus | 'all' | 'unmarked';
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
  
  const filteredStudents = students.filter((s) => {
    if (filter === 'all') return true;
    const status = records[s.id]?.status;
    if (filter === 'unmarked') return !status;
    return status === filter;
  });

  if (filteredStudents.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Bu filtreye uygun öğrenci bulunamadı.
      </div>
    );
  }
      
  return (
    <div className="w-full overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[60px] p-2 text-center">No</TableHead>
              <TableHead className="min-w-[150px]">Öğrenci Adı Soyadı</TableHead>
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
