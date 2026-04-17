import { describe, it, expect } from 'vitest';
import { ModelSerializer, ModelSerializationError } from './model-serialization.js';

describe('ModelSerializer', () => {
  const sampleArtifact = {
    version: '1.0.0',
    format: 'json' as const,
    createdAt: Date.now(),
    architecture: {
      layers: [{ type: 'dense', inputSize: 2, outputSize: 1 }]
    },
    weights: {
      w: [0.1, 0.2, 0.3, 0.4]
    }
  };

  it('should serialize and deserialize JSON', () => {
    const serializer = new ModelSerializer();
    const serialized = serializer.serializeToJSON(sampleArtifact);
    const restored = serializer.deserializeJSON(serialized);
    expect(restored.architecture.layers).toEqual(sampleArtifact.architecture.layers);
    expect(restored.weights.w).toEqual(sampleArtifact.weights.w);
  });

  it('should serialize and deserialize binary', () => {
    const serializer = new ModelSerializer();
    const serialized = serializer.serializeToBinary(sampleArtifact);
    const restored = serializer.deserializeBinary(serialized);
    expect(restored.architecture.layers).toEqual(sampleArtifact.architecture.layers);
    restored.weights.w.forEach((v, i) => expect(v).toBeCloseTo(sampleArtifact.weights.w[i], 6));
  });

  it('should throw on format mismatch', () => {
    const serializer = new ModelSerializer();
    const jsonSerialized = serializer.serializeToJSON(sampleArtifact);
    expect(() => serializer.deserializeBinary(jsonSerialized)).toThrow(ModelSerializationError);
  });

  it('should check version compatibility', () => {
    const serializer = new ModelSerializer();
    expect(serializer.checkCompatibility('1.2.3')).toBe(true);
    expect(serializer.checkCompatibility('2.0.0')).toBe(false);
  });
});
