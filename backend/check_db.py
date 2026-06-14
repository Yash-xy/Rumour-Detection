from app.database import engine
from sqlalchemy import text
conn = engine.connect()
rs = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'history'"))
print([row[0] for row in rs])
