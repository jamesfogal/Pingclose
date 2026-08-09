export interface ImageVideoAudit {
  imagesWithoutAlt: string[];
  hasAutoPlayVideo: boolean;
  videoHasPoster: boolean;
  imagesLazyLoaded: boolean;
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

  // Real signal from the actual markup, not a Lighthouse audit — Google
  // removed offscreen-images (the old source for this) with no replacement
  // (found 2026-08-08). Checks the standard native-lazy-loading attribute
  // directly: true if the page has images AND at least one uses it.
  const imagesLazyLoaded = imgTags.length > 0 && imgTags.some(tag => /loading=["']lazy["']/i.test(tag));

  return { imagesWithoutAlt, hasAutoPlayVideo, videoHasPoster, imagesLazyLoaded };
}
