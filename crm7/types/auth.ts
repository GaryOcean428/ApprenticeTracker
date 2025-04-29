export interface Auth0User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  picture?: string;
  roles?: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  picture?: string | null;
  role?: string;
  org_id?: string;
}

export interface User extends AuthUser {
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: AuthUser;
}

export type Provider = 'google' | 'github' | 'azure' | 'bitbucket' | 'discord' | 'facebook' | 'gitlab' | 'keycloak' | 'linkedin' | 'notion' | 'slack' | 'spotify' | 'twitch' | 'twitter' | 'workos';
