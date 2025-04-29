import { createSchemaComponent } from '@/lib/schema/component-factory';
import { type SchemaComponentConfig } from '@/lib/types/schema-component';

interface UserProfileProps {
  userId: string;
  showEmail?: boolean;
  layout?: 'card' | 'list';
}

const schema: SchemaComponentConfig = {
  dbTable: 'profiles',
  fields: {
    userId: {
      name: 'userId',
      type: 'text',
      label: 'User ID',
      validation: {
        required: true,
        custom: (value: unknown): boolean => {
          if (typeof value !== 'string') return false;
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
          return uuidRegex.test(value);
        }
      },
    },
    showEmail: {
      name: 'showEmail',
      type: 'radio',
      label: 'Show Email',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    layout: {
      name: 'layout',
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Card', value: 'card' },
        { label: 'List', value: 'list' },
      ],
    },
  },
  preview: {
    fields: ['layout', 'showEmail'],
    template: 'User Profile ({{layout}}){{#if showEmail}} with email{{/if}}',
  },
  validation: {
    rules: {
      userId: (value: unknown): boolean => {
        if (typeof value !== 'string') return false;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
      }
    },
    messages: {
      'userId.required': 'User ID is required',
      'userId.pattern': 'Invalid User ID format',
    },
  },
};

function UserProfileComponent({ 
  userId,
  showEmail = false,
  layout = 'card',
  data,
}: UserProfileProps & { data: any }): JSX.Element {
  if (!data) {
    return <div>No profile data available</div>;
  }

  const profile = Array.isArray(data) ? data[0] : data;

  return (
    <div className={layout === 'card' ? 'p-6 bg-white rounded-lg shadow-sm' : 'py-4'}>
      <div className="flex items-center gap-4">
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="w-12 h-12 rounded-full"
          />
        )}
        <div>
          <h3 className="font-semibold text-gray-900">
            {profile.full_name}
          </h3>
          {showEmail && profile.email && (
            <p className="text-sm text-gray-500">
              {profile.email}
            </p>
          )}
        </div>
      </div>
      {layout === 'card' && (
        <div className="mt-4 pt-4 border-t">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Member since</dt>
              <dd className="font-medium text-gray-900">
                {new Date(profile.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Last active</dt>
              <dd className="font-medium text-gray-900">
                {new Date(profile.last_sign_in_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

export const UserProfile = createSchemaComponent({
  name: 'UserProfile',
  schema,
  render: UserProfileComponent as (props: any) => JSX.Element,
});
