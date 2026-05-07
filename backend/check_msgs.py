from utils.supabase_client import get_supabase
sb = get_supabase()
res = sb.table('interview_sessions').select('id,target_role,created_at').order('created_at', desc=True).limit(3).execute()
for s in res.data:
  print(f"SESSION {s['id']}")
  msgs = sb.table('interview_messages').select('content').eq('session_id', s['id']).limit(2).execute()
  for m in msgs.data: print(m['content'][:40])

