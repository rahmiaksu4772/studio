'use server';

import { descriptionAutoFill } from '@/ai/flows/description-auto-fill';
import type { DescriptionAutoFillInput } from '@/ai/flows/description-auto-fill';
import { parseStudentList } from '@/ai/flows/student-list-parser';
import type { StudentListParserInput } from '@/ai/flows/student-list-parser';


export async function generateDescriptionAction(input: DescriptionAutoFillInput) {
  try {
    const result = await descriptionAutoFill(input);

    if (result?.description) {
      return { description: result.description };
    }
    
    return { description: "AI-powered description could not be generated." };

  } catch (error) {
    console.error('AI description generation failed:', error);
    return { error: 'AI ile açıklama üretilirken bir hata oluştu.' };
  }
}

export async function parseStudentListAction(input: StudentListParserInput) {
    try {
      const result = await parseStudentList(input);
      if (result?.classes) {
        return { classes: result.classes };
      }
      return { error: 'Dosya ayrıştırılamadı.' };
    } catch (error) {
      console.error('Student list parsing failed:', error);
      return { error: 'Dosya ayrıştırılırken bir hata oluştu.' };
    }
}
