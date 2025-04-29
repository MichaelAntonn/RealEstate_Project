export function normalizeTags(tags: string | string[] | null | undefined): string[] {
    if (typeof tags === 'string') {
      return tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag);
    }
    if (Array.isArray(tags)) {
      return tags.map((tag: string) => tag.trim()).filter((tag: string) => tag);
    }
    return [];
  }