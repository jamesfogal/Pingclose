export function detectWordPressIssues(html: string, cms: string, pageBuilder: string, hasGA4: boolean, hasGTM: boolean): string[] {
  const wordpressPluginIssues: string[] = [];
  if (cms !== 'WordPress') return wordpressPluginIssues;

  if (html.includes('rocket-loader')) wordpressPluginIssues.push('Cloudflare Rocket Loader detected — often conflicts with WordPress and adds load time instead of reducing it');
  if (html.includes('revslider') || html.includes('revolution-slider')) wordpressPluginIssues.push('Revolution Slider detected — heavy plugin known to significantly slow page load');
  if (html.includes('visual-composer') || html.includes('vc_row')) wordpressPluginIssues.push('Visual Composer / WPBakery detected — generates bloated HTML that slows rendering');
  if (pageBuilder === 'Elementor') wordpressPluginIssues.push('Elementor detected — loads significant CSS/JS overhead; needs aggressive optimization');
  if (html.includes('jquery')) wordpressPluginIssues.push('jQuery loaded — adds ~30KB; modern WordPress sites can eliminate this dependency');
  if (!hasGA4 && !hasGTM) wordpressPluginIssues.push('No analytics detected — no way to track which pages are converting visitors');

  return wordpressPluginIssues;
}
