import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function generateImageToImage(
  imageUrl: string,
  prompt: string,
  negativePrompt: string
): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux-pro/v1.1/redux", {
    input: {
      image_url: imageUrl,
      prompt: prompt,
      negative_prompt: negativePrompt,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      image_size: "square_hd", // 1024x1024
      num_images: 1,
      output_format: "jpeg",
      output_quality: 95,
    } as any,
  });
  // @ts-ignore
  return result.data.images[0].url;
}

export async function removeBackgroundAPI(imageBase64: string): Promise<Buffer> {
  // Extract base64 part if it's a data URL
  const b64Data = imageBase64.includes('base64,') ? imageBase64.split('base64,')[1] : imageBase64;
  
  const formData = new FormData();
  formData.append("image_file_b64", b64Data);
  formData.append("size", "auto");
  formData.append("format", "png");

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": process.env.REMOVEBG_API_KEY! },
    body: formData,
  });
  
  if (!response.ok) {
     const text = await response.text();
     throw new Error(`Remove.bg API Error: ${response.status} - ${text}`);
  }

  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}
