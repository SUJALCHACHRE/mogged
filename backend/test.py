from utils.supabase_client import get_supabase
sb = get_supabase()
res = sb.table('interview_sessions').select('id').order('created_at', desc=True).limit(1).execute()
session_id = res.data[0]['id']
msgs = sb.table('interview_messages').select('role,content,timestamp_ms').eq('session_id', session_id).order('timestamp_ms').execute()
print('SESSION:', session_id)
for m in msgs.data: print(f"{m['role']} ({m['timestamp_ms']}): {m['content'][:30]}...")
