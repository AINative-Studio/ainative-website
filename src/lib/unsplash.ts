/**
 * Unsplash Image Utility
 * Uses real Unsplash photo IDs with the image CDN
 */

// Real Unsplash photo IDs from business/tech categories
// Format: photo ID from actual Unsplash images
const PHOTO_IDS = [
  '1497366216548-37526070297c',  // office workspace
  '1498050108023-c5249f4df085',  // coding on laptop
  '1522071820081-009f0129c71c',  // team collaboration
  '1484480974693-6ca0a78fb36b',  // laptop and coffee
  '1497366412874-3415097a27e7',  // startup office
  '1460925895917-afdab827c52f',  // data visualization
  '1504384308090-c894fdcc538d',  // modern workspace
  '1519389950473-47ba0277781c',  // technology
  '1517245386807-bb43f82c33c4',  // business meeting
];

/**
 * Get Unsplash image URL using their CDN
 * @param id - Content ID to generate consistent image
 * @param width - Image width
 * @param height - Image height
 * @returns Unsplash image URL
 */
export function getUnsplashImageUrl(id: number, width: number, height: number): string {
  // Select photo ID based on content ID for consistency
  const photoId = PHOTO_IDS[id % PHOTO_IDS.length];

  // Use Unsplash's imgix CDN with proper parameters
  // This URL format works without requiring the deprecated source API
  return `https://images.unsplash.com/photo-${photoId}?ixlib=rb-4.0.3&w=${width}&h=${height}&fit=crop&q=80&fm=jpg`;
}

/**
 * Get keywords for search-based images (for future use)
 */
export function getImageKeywords(id: number): string {
  const keywordSets = [
    'business,office,workspace',
    'coding,programming,laptop',
    'technology,computer,software',
    'startup,innovation,team',
    'data,analytics,dashboard',
    'developer,workspace,desk',
    'collaboration,teamwork,meeting',
    'professional,corporate,work',
    'digital,tech,modern'
  ];
  return keywordSets[id % keywordSets.length];
}
