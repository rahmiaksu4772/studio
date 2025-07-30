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
  
  const getFilteredStudents = () => {
    if (filter === 'all') return students;
    if (filter === 'Y' || filter === 'G') {
       return students.filter(s => records[s.id]?.status === filter);
    }
    return students.filter(s => {
      const record = records[s.id];
      if (!record || !record.status) return false;
      
      if (filter === '+') return record.status === '+' || record.status === '½';
      if (filter === '-') return record.status === '-';
      
      // A special case for unmarked students
      if (filter === 'unmarked') return !record.status;
      
      return record.status === filter;
    });
  }

  const filteredStudents =
    filter === 'all'
      ? students
      : students.filter((s) => {
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
