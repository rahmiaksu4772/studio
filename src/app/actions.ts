'use server';

import { descriptionAutoFill } from '@/ai/flows/description-auto-fill';

export async function generateDescriptionAction(input: {
  studentId: string;
  classId: string;
  recordDate: string;
}) {
  try {
    const result = await descriptionAutoFill(input);

    if (result?.description) {
      return { description: result.description };
    }
    
    return { description: "AI-powered description could not be generated." };

  } catch (error) {
    console.error('AI description generation failed:', error);
    return { error: 'Açıklama üretilirken bir hata oluştu.' };
  }
}
