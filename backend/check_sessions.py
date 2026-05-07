from utils.supabase_client import get_supabase
sb = get_supabase()
res = sb.table('interview_sessions').select('id,target_role,created_at').order('created_at', desc=True).limit(5).execute()
for r in res.data: print(r)

