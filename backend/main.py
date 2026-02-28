from flask import Flask, request, jsonify, session, make_response, redirect
from flask_cors import CORS
from dotenv import load_dotenv
import mysql.connector


import psycopg2
import secrets, datetime
import bcrypt
import os, smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import hashlib
import boto3

print("at the start of the main backend")
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"]}}, 
     supports_credentials=True, allow_headers=["Content-Type"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]) 

password = os.getenv("MySQL_Password")
conn = None
try:
    conn = mysql.connector.connect(
        host='mealswipe-backend-db.cupg6kqiyitn.us-east-1.rds.amazonaws.com',
        port=3306,
        database='testdb',
        user='admin',
        password=password,
        ssl_disabled=False,
    ssl_ca='/certs/global-bundle.pem'
    )
    cur = conn.cursor()
    cur.execute('SELECT VERSION();')
    print(cur.fetchone()[0])
    cur.close()
except Exception as e:
    print(f"Database error: {e}")
    raise
finally:
    if conn:
        conn.close()
print("out")

#API routing
@app.route("/api/asdf")
def hello_world():
    return "<p> Hello World! </p>"

@app.route("/api/get_order", methods=["POST", "OPTIONS"])
def get_order():
    if request.method == "OPTIONS":
        return '', 200
    
    data = request.get_json()
    
    print("This is data", data)
    return "<p> Received </p>"

waitlist_data = []
@app.route("/api/waitlist", methods=["POST", "OPTIONS"])
def waitlist():
    if request.method == "OPTIONS":
        return '', 200
    
    data = request.get_json()
    
    print("This is data", data)
    # print(type(waitlist))
    waitlist_data.append(data)
    print("This is waitlist", waitlist_data)
    return "<p> Waitlist Received </p>"

@app.route("/api/take_off_waitlist", methods=["POST", "OPTIONS"])
def take_off_waitlist():
    if request.method == "OPTIONS":
        return '', 200
    
    data = request.get_json()
    
    print("This is data", data)
    waitlist_data.pop(int(data))
    print("This is the new popped waitlist", waitlist_data)
    return waitlist_data

app.run(port=5000, debug=True)