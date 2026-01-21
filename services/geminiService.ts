
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Severity } from "../types";

export const analyzeSafetyImage = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Bạn là một kỹ sư an toàn công trình chuyên nghiệp (HSE Expert).
    Hãy phân tích ảnh này và tìm ra các vi phạm an toàn lao động (ví dụ: thiếu lan can, công nhân không đội mũ bảo hiểm, không đeo dây an toàn, giàn giáo không chuẩn, khu vực nguy hiểm không có biển báo, v.v.).
    
    Với mỗi lỗi, hãy cung cấp chi tiết bao gồm tên lỗi, mức độ nghiêm trọng, hiện trạng, rủi ro tiềm ẩn và biện pháp khắc phục.
    Quan trọng: Phải xác định tọa độ chính xác của lỗi bằng box_2d [ymin, xmin, ymax, xmax] theo thang điểm 0-1000.
    
    Trả về kết quả bằng tiếng Việt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1] || base64Image,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  issue_name: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: [Severity.HIGH, Severity.MEDIUM, Severity.LOW] },
                  status: { type: Type.STRING },
                  risk: { type: Type.STRING },
                  remedy: { type: Type.STRING },
                  box_2d: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER },
                    description: "[ymin, xmin, ymax, xmax]"
                  }
                },
                required: ["issue_name", "severity", "status", "risk", "remedy", "box_2d"]
              }
            },
            summary: { type: Type.STRING, description: "A brief summary of the site safety level" }
          },
          required: ["issues", "summary"]
        }
      },
    });

    const result = JSON.parse(response.text);
    return result as AnalysisResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Không thể phân tích hình ảnh. Vui lòng thử lại.");
  }
};
