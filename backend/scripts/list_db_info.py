from dotenv import load_dotenv
import os
import psycopg2
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()
cur.execute("SELECT DISTINCT idgrado_trabajado FROM alumno ORDER BY idgrado_trabajado;")
print('Grados:', [r[0] for r in cur.fetchall()])
cur.execute("SELECT DISTINCT bimestre FROM nota ORDER BY bimestre;")
print('Bimestres:', [r[0] for r in cur.fetchall()])
conn.close()
