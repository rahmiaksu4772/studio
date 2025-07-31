'use server';

import { descriptionAutoFill } from '@/ai/flows/description-auto-fill';
import type { DescriptionAutoFillInput } from '@/ai/flows/description-auto-fill';
import { opticalScan } from '@/ai/flows/optical-scan-flow';
import type { OpticalScanInput } from '@/ai/schemas/optical-scan-schemas';


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

export async function opticalScanAction(input: OpticalScanInput) {
    try {
      const result = await opticalScan(input);
      return result;
    } catch (error) {
      console.error('AI optical scan failed:', error);
      return { error: 'Yapay zeka ile optik form okunurken bir hata oluştu.' };
    }
  }

