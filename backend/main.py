from flask import Flask, request, jsonify, session, make_response, redirect
from flask_cors import CORS
from dotenv import load_dotenv
import mysql.connector
import boto3

import hashlib


import psycopg2
import secrets, datetime
import bcrypt

import os, smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import psycopg2


print("at the start of the main backend")
load_dotenv()

def hash_function(curr_pass):
    combined = curr_pass.encode()
    a = bcrypt.hashpw(combined, bcrypt.gensalt()) 
    return (a.decode())

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

@app.route("/api/signup_info", methods=["POST", "OPTIONS"])
def login_info():
    if request.method == "OPTIONS":
        return '', 200
    
    data = request.get_json()
        
    try:
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
        # cursor.execute("CREATE TABLE login_info (" \
        # "Username VARCHAR(100) NOT NULL PRIMARY KEY," \
        # "Email VARCHAR(100)," \
        # "PASSWORD VARCHAR(100))")
   

        cursor.execute("INSERT INTO login_info (Username, Email, PASSWORD) VALUES "
        "(%s, %s, %s)", (data.get("username"), data.get("email"), hash_function(data.get("password"))))


        cursor.execute("SELECT * FROM login_info")
        rows = cursor.fetchall()
        for row in rows:
            print(row)

        conn.commit()

    except Exception as e:
        print(f"Database error: {e}")
        raise
    finally:
        if conn:
            conn.close()

    print("This is data", data)
    return "<p> Signup info received </p>"


@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return '', 200
    
    data = request.get_json()
        
    try:
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


        cursor.execute("""
            SELECT PASSWORD FROM login_info WHERE Username = %s
        """, (data['username'],))
        row = cursor.fetchone()
        if row:
            print("This is row", row)
            stored_hash = row[0]

            is_valid = bcrypt.checkpw(data['password'].encode(), stored_hash.encode())
            print("Password Match:", is_valid)
            return (is_valid)
        else:
            print("Not found")

       
    except Exception as e:
        print(f"Database error: {e}")
        raise
    finally:
        if conn:
            conn.close()

    print("This is data", data)
    return "<p> Signup info received </p>"

app.run(port=5000, debug=True)