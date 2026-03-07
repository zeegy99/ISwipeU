import mysql.connector
import os 
from dotenv import load_dotenv

load_dotenv()

password = os.getenv("MySQL_Password")

conn = mysql.connector.connect(
        host='mealswipe-backend-db.cupg6kqiyitn.us-east-1.rds.amazonaws.com',
        port=3306,
        database='dev',
        user='admin',
        password=password,
        ssl_disabled=False,
    ssl_ca='/certs/global-bundle.pem'
    )


cursor = conn.cursor()
cursor.execute("""CREATE TABLE user_roles (
    Username VARCHAR(100) NOT NULL PRIMARY KEY,
    Role ENUM('admin', 'guest', 'swiper') NOT NULL DEFAULT 'swiper',
    FOREIGN KEY (Username) REFERENCES login_info(Username) ON DELETE CASCADE
);""")

conn.commit()  
cursor.close()
conn.close()

print("Table created successfully")