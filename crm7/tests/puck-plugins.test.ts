// This file expands tests for our Puck plugins
import { describe, it, expect } from 'vitest';
import { validationPlugin } from '@/components/admin/plugins/validation';

describe('Validation Plugin', () => {
  it('should pass for valid content', async () => {
    const validContent = {
      zones: {
        main: [{ type: 'Text', props: { content: 'Hello' }, _requiredFields: ['content'] }]
      }
    };
    let published = false;
    await validationPlugin.overrides.onPublish({
      data: validContent,
      defaultOnPublish: async () => { published = true; }
    });
    expect(published).toBe(true);
  });

  it('should fail for missing required fields', async () => {
    const invalidContent = {
      zones: {
        main: [{ type: 'Text', props: { content: '' }, _requiredFields: ['content'] }]
      }
    };
    let published = false;
    await validationPlugin.overrides.onPublish({
      data: invalidContent,
      defaultOnPublish: async () => { published = true; }
    });
    expect(published).toBe(false);
  });
});
