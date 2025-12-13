import { ParsedArtifact, ArtifactType } from '../types/artifacts';

/**
 * Parse AI response untuk detect artifacts
 * Format yang didukung:
 * - <artifact command="create" id="xxx" type="xxx" title="xxx">content</artifact>
 * - <artifact command="update" id="xxx">
 *     <old_str>...</old_str>
 *     <new_str>...</new_str>
 *   </artifact>
 */
export function parseArtifactsFromMessage(message: string): ParsedArtifact[] {
  const artifacts: ParsedArtifact[] = [];
  
  // Regex untuk match artifact tags
  const artifactRegex = /<artifact([^>]*)>([\s\S]*?)<\/artifact>/g;
  let match;
  
  while ((match = artifactRegex.exec(message)) !== null) {
    const attributesStr = match[1];
    const content = match[2].trim();
    
    // Parse attributes
    const attributes: Record<string, string> = {};
    const attrRegex = /(\w+)="([^"]*)"/g;
    let attrMatch;
    
    while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
      attributes[attrMatch[1]] = attrMatch[2];
    }
    
    const command = attributes.command as 'create' | 'update' | 'rewrite';
    const id = attributes.id;
    
    if (!id) continue;
    
    if (command === 'create' || command === 'rewrite') {
      artifacts.push({
        command,
        id,
        type: attributes.type as ArtifactType,
        title: attributes.title,
        content,
        language: attributes.language
      });
    } else if (command === 'update') {
      // Parse old_str dan new_str
      const oldStrMatch = content.match(/<old_str>([\s\S]*?)<\/old_str>/);
      const newStrMatch = content.match(/<new_str>([\s\S]*?)<\/new_str>/);
      
      if (oldStrMatch && newStrMatch) {
        artifacts.push({
          command,
          id,
          updates: [{
            id,
            oldStr: oldStrMatch[1].trim(),
            newStr: newStrMatch[1].trim()
          }]
        });
      }
    }
  }
  
  return artifacts;
}

/**
 * Remove artifact tags dari message untuk ditampilkan di chat
 */
export function removeArtifactTags(message: string): string {
  return message.replace(/<artifact[^>]*>[\s\S]*?<\/artifact>/g, '').trim();
}

/**
 * Check apakah message mengandung artifacts
 */
export function hasArtifacts(message: string): boolean {
  return /<artifact/i.test(message);
}
