import PptxGenJS from "pptxgenjs";

interface SlideItem {
  heading?: string;
  bullets?: string[];
  descriptions?: string[];
  notes?: string;
  images?: { base64: string; caption?: string }[];
}


export async function generatePptFromJson(
  slideJson: { title?: string; slides: SlideItem[] },
  progressCallback?: (p: { slideIndex: number; total: number }) => void
) {
  const pptx = new PptxGenJS();
  
  // Standard widescreen layout (16:9)
  pptx.defineLayout({ name: "LAYOUT_WIDE", width: 10, height: 5.625 });
  pptx.layout = "LAYOUT_WIDE";
  
  // Set presentation properties
  pptx.author = "AI PowerPoint Generator";
  pptx.title = slideJson.title || "AI Generated Presentation";
  pptx.subject = "Generated via AI";

  const slides = slideJson.slides || [];
  const MARGIN = 0.5;
  const CONTENT_WIDTH = 10 - (MARGIN * 2);

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const slide = pptx.addSlide();
    
    // Add subtle background
    slide.background = { color: "FFFFFF" };
    
    let currentY = MARGIN;

    // Add heading
    if (s.heading) {
      const headingHeight = 0.7;
      slide.addText(s.heading, { 
        x: MARGIN, 
        y: currentY, 
        w: CONTENT_WIDTH, 
        h: headingHeight,
        fontSize: 32, 
        bold: true,
        color: "1F2937",
        align: "left",
        valign: "top",
        wrap: true,
        breakLine: true
      });
      currentY += headingHeight + 0.2;
    }

    // Add descriptions (subtitles/additional context)
    if (s.descriptions && s.descriptions.length > 0) {
      s.descriptions.forEach((desc, idx) => {
        const descHeight = Math.max(0.4, Math.ceil(desc.length / 100) * 0.3);
        
        slide.addText(desc, { 
          x: MARGIN, 
          y: currentY, 
          w: CONTENT_WIDTH,
          h: descHeight,
          fontSize: 16, 
          color: "6B7280",
          align: "left",
          valign: "top",
          wrap: true,
          breakLine: true
        });
        
        currentY += descHeight + 0.15;
      });
      
      currentY += 0.1; // Extra spacing before bullets
    }


    // Add bullet points
    if (s.bullets && s.bullets.length > 0) {
      // Calculate available space
      const availableHeight = 5.625 - currentY - MARGIN;
      
      // Estimate height needed (rough calculation)
      const estimatedBulletHeight = s.bullets.length * 0.35;
      
      let fontSize = 18;
      let bulletSpacing = 0.35;
      
      // Adjust font size if content is too tall
      if (estimatedBulletHeight > availableHeight) {
        fontSize = 16;
        bulletSpacing = 0.3;
      }
      
      // Very dense content
      if (s.bullets.length > 8) {
        fontSize = 14;
        bulletSpacing = 0.25;
      }

      slide.addText(
        s.bullets.map((b) => ({ 
          text: b,
          options: {
            bullet: { 
              type: "bullet",
              characterCode: "2022", // bullet character
              indent: 0.3
            }
          }
        })),
        { 
          x: MARGIN, 
          y: currentY, 
          w: CONTENT_WIDTH,
          h: availableHeight - 0.2,
          fontSize: fontSize,
          color: "374151",
          align: "left",
          valign: "top",
          wrap: true,
          lineSpacing: bulletSpacing * 72, // Convert to points
          breakLine: true
        }
      );
    }

    // Add slide notes if provided
    if (s.notes) {
      slide.addNotes(s.notes);
    }

    // Add slide number footer (optional)
    slide.addText(`${i + 1} / ${slides.length}`, {
      x: 9.0,
      y: 5.3,
      w: 0.8,
      h: 0.25,
      fontSize: 10,
      color: "9CA3AF",
      align: "right",
      valign: "bottom"
    });

    progressCallback?.({ slideIndex: i + 1, total: slides.length });
  }

  return new Promise<{ blob: Blob; base64: string }>((resolve, reject) => {
    pptx.write({ outputType: "base64" })
      .then((base64) => {
        const blob = b64toBlob(
          base64 as string,
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        );
        resolve({ blob, base64: base64 as string });
      })
      .catch((error) => {
        console.error("PPT generation error:", error);
        reject(error);
      });
  });
}

function b64toBlob(b64Data: string, contentType = "application/octet-stream"): Blob {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}