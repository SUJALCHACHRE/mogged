from utils.supabase_client import get_supabase
sb = get_supabase()
res = sb.table('session_reports').select('session_id,overall_score,top_strengths,created_at').order('created_at', desc=True).limit(3).execute()
for r in res.data: print(r)

