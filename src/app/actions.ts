'use server';

import { descriptionAutoFill } from '@/ai/flows/description-auto-fill';
import type { DescriptionAutoFillInput } from '@/ai/flows/description-auto-fill';
import { parseStudentList } from '@/ai/flows/student-list-parser';
import type { StudentListParserOutput } from '@/ai/flows/student-list-parser';


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

// Define the input type for parseStudentListAction locally
// as it's no longer exported from the flow file.
type StudentListParserInput = {
    fileDataUri: string;
};

export async function parseStudentListAction(input: StudentListParserInput): Promise<{ classes: StudentListParserOutput['classes'] } | { error: string }> {
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
