import { type Session } from '@supabase/supabase-js';

export interface AppHeaderProps {
  session: Session;
}

export interface AppSidebarProps {
  session: Session;
}
