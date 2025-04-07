import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eeryivzgrgkarzwyuvun.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcnlpdnpncmdrYXJ6d3l1dnVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODIxMDI5MywiZXhwIjoyMDUzNzg2MjkzfQ.C1WbeHKKtIxhBO7CIjnx1yvu_1lgt0Rj-bedp3WfePA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
