export class UniqueStringGenerator {
  private usedStrings: Set<string> = new Set();

  public generate(length: number = 10): string {
    let newString: string;
    do {
      newString = this.generateRandomString(length);
    } while (this.usedStrings.has(newString));

    this.usedStrings.add(newString);
    return newString;
  }

  private generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }
}