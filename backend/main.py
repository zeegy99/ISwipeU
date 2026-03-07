from flask import Flask, request, jsonify, session, make_response, redirect
from flask_cors import CORS
from dotenv import load_dotenv
import mysql.connector
import boto3
import os, smtplib, ssl
import random 

import stripe 

import hashlib

import bcrypt
from datetime import timedelta

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


import secrets, datetime



from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart



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
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
app.secret_key = os.getenv("SIGN_SECRET_KEY")

app.permanent_session_lifetime = timedelta(days=7)
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
        cursor.execute(
            "INSERT INTO waitlist (Username) VALUES (%s)",
            (data.get("username"),)
        )
        conn.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/get_waitlist", methods=["GET", "OPTIONS"])
def get_waitlist():
    if request.method == "OPTIONS":
        return '', 200

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
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM waitlist ORDER BY created_at ASC")
        rows = cursor.fetchall()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

removed_users = {}
@app.route("/api/take_off_waitlist", methods=["POST", "OPTIONS"])
def take_off_waitlist():
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

        cursor.execute("""SELECT Username FROM waitlist where id = %s""", (data.get("id"), ))
        row = cursor.fetchone()
        if row: 
            code = random.randint(1000, 9999)
            removed_users[row[0]] = {"code": code, "picked_up_by": data.get("picked_up_by")}
            print("This is removed_users", removed_users)
        cursor.execute("DELETE FROM waitlist WHERE id = %s", (data.get("id"),))
        conn.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/api/check_removed", methods=["POST", "OPTIONS"])
def check_removed():
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()
    username = data.get("username")

    if username in removed_users:
        return jsonify({"removed": True,
                        "code": removed_users[username]['code'],
                        "picked_up_by": removed_users[username]['picked_up_by']}), 200
    
    return jsonify({"removed": False}), 200

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

                
        cursor.execute(
            "INSERT INTO user_roles (Username, Role) VALUES (%s, 'guest')",
            (data.get("username"),)
        )


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
            SELECT PASSWORD, USERNAME FROM login_info WHERE Username = %s
        """, (data['username'],))
        row = cursor.fetchone()
        if row:
            print("This is row", row)
            stored_hash = row[0]

            is_valid = bcrypt.checkpw(data['password'].encode(), stored_hash.encode())
            print("Password Match:", is_valid)

            if is_valid:
                session.permanent = True
                session['username'] = row[1]
                return jsonify({"success": True})
            else:
                session.permanent = False
                return jsonify({"success": False})
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
 
@app.route("/api/session", methods=["GET", "OPTIONS"])
def get_session():

    if request.method == "OPTIONS":
        return '', 200

    username = session.get('username')

    if username:
        print("this was got", username)
        return jsonify({"logged_in": True, "username": username}), 200
    else:
        print("no username")
        return jsonify({"logged_in": False}), 401
    

@app.route("/api/logout", methods=["POST", "OPTIONS"])
def logout():
    if request.method == "OPTIONS":
        return '', 200
     
    session.clear()
    return jsonify({"success": True}), 200
    

@app.route("/api/find_role", methods=["POST", "OPTIONS"])
def find_role():
    if request.method == "OPTIONS":
        return '', 200
    
    
    data = request.get_json()
    # print("this is data")    
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

    cursor.execute("""SELECT Role from user_roles where Username like %s""", (data['username'],))
    row = cursor.fetchone()

    if row:
        print(row)
        return "good"
    else:
        print('nothing found')
        return "none"


@app.route("/api/change_role", methods=["POST", "OPTIONS"])
def change_role():
    if request.method == "OPTIONS":
        return '', 200
    
    
    data = request.get_json()
        
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

    cursor.execute("""UPDATE user_roles
                   SET Role = %s where Username like %s""", (data['Role'], data['Username'], ))
    
    conn.commit()

    cursor.close()
    conn.close()
    return 



# # ----------------------------
# # STRIPE - SELLER ONBOARDING
# # ----------------------------

# @app.route("/api/connect", methods=["POST", "OPTIONS"])
# def create_connect_account():
#     if request.method == "OPTIONS":
#         return '', 200

#     data = request.get_json()
#     user_id = data.get("user_id")

#     account = stripe.Account.create(type="express")

#     # TODO: save account.id to your DB linked to user_id
#     # cursor.execute("UPDATE login_info SET stripe_account_id = %s WHERE Username = %s", (account.id, user_id))

#     account_link = stripe.AccountLink.create(
#         account=account.id,
#         refresh_url="http://localhost:5173/seller/onboard",
#         return_url="http://localhost:5173/seller/dashboard",
#         type="account_onboarding",
#     )

#     return jsonify({"url": account_link.url})


# # ----------------------------
# # STRIPE - BUYER CHECKOUT
# # ----------------------------

# @app.route("/api/checkout", methods=["POST", "OPTIONS"])
# def create_payment_intent():
#     if request.method == "OPTIONS":
#         return '', 200

#     data = request.get_json()
#     amount = data.get("amount")                              
#     seller_stripe_account_id = data.get("seller_stripe_account_id")  # from your DB

#     platform_fee = round(amount * 0.10)  # 10% platform fee

#     intent = stripe.PaymentIntent.create(
#         amount=amount,
#         currency="usd",
#         application_fee_amount=platform_fee,
#         transfer_data={
#             "destination": seller_stripe_account_id,
#         },
#     )

#     return jsonify({"client_secret": intent.client_secret})


# # ----------------------------
# # STRIPE - WEBHOOKS
# # ----------------------------

# @app.route("/api/webhooks/stripe", methods=["POST"])
# def stripe_webhook():
#     payload = request.get_data(as_text=True)
#     sig_header = request.headers.get("Stripe-Signature")

#     try:
#         event = stripe.Webhook.construct_event(
#             payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
#         )
#     except stripe.error.SignatureVerificationError:
#         return jsonify({"error": "Invalid signature"}), 400

#     event_type = event["type"]
#     data = event["data"]["object"]

#     if event_type == "payment_intent.succeeded":
#         payment_intent_id = data["id"]
#         amount = data["amount"]
#         # TODO: mark order as paid in your DB
#         print(f"Payment succeeded: {payment_intent_id} for ${amount / 100:.2f}")

#     elif event_type == "account.updated":
#         account_id = data["id"]
#         if data.get("details_submitted"):
#             # TODO: mark seller as verified in your DB
#             print(f"Seller onboarded: {account_id}")

#     return jsonify({"status": "ok"}), 200


app.run(port=5000, debug=True)