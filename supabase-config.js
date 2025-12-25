import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://wboyqbtrzxipbbmpzpqn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indib3lxYnRyenhpcGJibXB6cHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MDQ0NzYsImV4cCI6MjA4MjE4MDQ3Nn0.fXuvxprwmQqrVegdECLAfBPblief4VOI0fnCn2baYWE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
