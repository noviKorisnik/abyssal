import { adjectives } from './adjectives';
import { nouns } from './nouns';

export class NameGenerator {
  /**
   * Generate a list of unique random names combining adjectives and nouns
   * @param count Number of names to generate
   * @returns Array of unique name strings
   */
  static generateNames(count: number = 8): string[] {
    const names = new Set<string>();
    const maxAttempts = count * 10; // Prevent infinite loops
    let attempts = 0;

    while (names.size < count && attempts < maxAttempts) {
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const name = `${adjective} ${noun}`;
      names.add(name);
      attempts++;
    }

    return Array.from(names);
  }
}
