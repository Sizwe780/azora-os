/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const axios = require('axios');
const { spawnTwin, processFeatures, getTwin } = require('../src/services/twinService');

jest.mock('axios');

describe('OntologicalTwinShield Service', () => {
  it('should spawn a new twin successfully', () => {
    const twin = spawnTwin('user-123', 'jnb-ops');
    expect(twin.id).toBeDefined();
    expect(twin.userId).toBe('user-123');
    const retrievedTwin = getTwin(twin.id);
    expect(retrievedTwin).toBe(twin);
  });

  it('should process features by calling the quantum service', async () => {
    const twin = spawnTwin('user-456', 'cpt-cargo');
    // Mock the axios calls
    axios.post.mockImplementation((url) => {
      if (url.includes('submit_circuit')) {
        return Promise.resolve({ data: { provenance: { hash: 'abc' } } });
      }
      if (url.includes('simulate')) {
        return Promise.resolve({ data: { confidence: 0.8 } });
      }
    });
    const result = await processFeatures(twin.id, { classicalScore: 0.7 });
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/submit_circuit'), expect.any(Object));
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/simulate'), expect.any(Object));
    expect(result.simulationResult.confidence).toBe(0.8);
    expect(getTwin(twin.id).state.embeddingHandle.hash).toBe('abc');
  });
});
