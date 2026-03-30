import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ioctvhpgfbnjemphtqqa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvY3R2aHBnZmJuamVtcGh0cXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NzUyMzIsImV4cCI6MjA5MDI1MTIzMn0.KOZG1Gsy-Wh_77wwoLjwc7UI8YACNHsTTmLLHUOt5Kc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)