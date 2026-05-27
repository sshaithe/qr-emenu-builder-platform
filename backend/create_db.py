import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    # Connect to the default 'postgres' database
    conn = psycopg2.connect(
        dbname='postgres',
        user='postgres',
        password='138905',
        host='localhost',
        port='5432'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    cursor.execute('CREATE DATABASE qr_emenu')
    print("Database qr_emenu created successfully!")
    cursor.close()
    conn.close()
except psycopg2.errors.DuplicateDatabase:
    print("Database qr_emenu already exists.")
except Exception as e:
    print(f"Error: {e}")
