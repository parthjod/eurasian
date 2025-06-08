// Face recognition utility functions
export class FaceRecognitionUtils {
  // Calculate Euclidean distance between two face descriptors
  static calculateDistance(descriptor1: number[], descriptor2: number[]): number {
    if (descriptor1.length !== descriptor2.length) {
      throw new Error('Descriptors must have the same length');
    }

    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      const diff = descriptor1[i] - descriptor2[i];
      sum += diff * diff;
    }

    return Math.sqrt(sum);
  }

  // Check if two faces match based on threshold
  static isFaceMatch(descriptor1: number[], descriptor2: number[], threshold: number = 0.6): boolean {
    const distance = this.calculateDistance(descriptor1, descriptor2);
    return distance < threshold;
  }

  // Find best matching face from multiple candidates
  static findBestMatch(
    inputDescriptor: number[], 
    candidates: Array<{ descriptor: number[], userId: string, distance?: number }>
  ): { userId: string; distance: number; isMatch: boolean } | null {
    
    if (!candidates.length) return null;

    let bestMatch = {
      userId: '',
      distance: Infinity,
      isMatch: false,
    };

    for (const candidate of candidates) {
      const distance = this.calculateDistance(inputDescriptor, candidate.descriptor);
      
      if (distance < bestMatch.distance) {
        bestMatch = {
          userId: candidate.userId,
          distance,
          isMatch: distance < 0.6, // Threshold for face match
        };
      }
    }

    return bestMatch.distance === Infinity ? null : bestMatch;
  }

  // Validate face descriptor format
  static isValidDescriptor(descriptor: any): boolean {
    return (
      Array.isArray(descriptor) &&
      descriptor.length === 128 &&
      descriptor.every(val => typeof val === 'number' && !isNaN(val))
    );
  }
}