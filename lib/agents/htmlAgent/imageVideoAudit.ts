export interface ImageVideoAudit {
  imagesWithoutAlt: string[];
  hasAutoPlayVideo: boolean;
  videoHasPoster: boolean;
}

export function auditImagesAndVideo(html: string): ImageVideoAudit {
  const imgTags = html.match(/<img[^>]+>/gi) || [];
  const imagesWithoutAlt = imgTags
    .filter(tag => !tag.includes('alt=') || tag.includes('alt=""') || tag.includes("alt=''"))
    .map(tag => { const m = tag.match(/src=["']([^"']+)["']/i); return m?.[1] || ''; })
    .filter(Boolean)
    .slice(0, 10);

  const videoTags = html.match(/<video[^>]*>/gi) || [];
  const hasAutoPlayVideo = videoTags.some(t => t.includes('autoplay'));
  const videoHasPoster = videoTags.some(t => t.includes('poster='));

  return { imagesWithoutAlt, hasAutoPlayVideo, videoHasPoster };
}
