/**
 * Generates a URL-friendly slug from a name
 * Example: "John Doe" -> "john-doe"
 */
export const generateSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generates a unique slug by appending a short random suffix if needed
 */
export const generateUniqueSlug = (name: string): string => {
  const baseSlug = generateSlugFromName(name);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSuffix}`;
};

/**
 * Validates if a slug is URL-safe
 */
export const isValidSlug = (slug: string): boolean => {
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
};
