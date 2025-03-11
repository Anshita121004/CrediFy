from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import numpy as np
import joblib

app = Flask(__name__)
app.secret_key = "your_secret_key"  # For session handling

# Load trained model
model = joblib.load("model.pkl")

# Label Encoding (Ensure this matches your training data encoding)
BANK_TRANSACTIONS = {"Low": 0, "Medium": 1, "High": 2}
MARKET_TREND = {"Declining": 0, "Stable": 1, "Growing": 2}

# Dummy users (For simple login)
USERS = {"admin": "password123", "user": "test123"}

@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        if username in USERS and USERS[username] == password:
            session["user"] = username  # Store session
            return redirect(url_for("dashboard"))
        return "Invalid credentials, try again."
    return render_template("login.html")

@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("dashboard.html")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Get user input from form
        data = request.json
        revenue = float(data["revenue"])
        loan = float(data["loan"])
        gst_compliance = int(data["gst"])
        past_defaults = int(data["defaults"])
        bank_transaction = BANK_TRANSACTIONS[data["bank"]]
        market_trend = MARKET_TREND[data["market"]]
        credit_score = float(data["credit"])

        # Create input array
        input_data = np.array([[revenue, loan, gst_compliance, past_defaults, bank_transaction, market_trend, credit_score]])

        # Predict
        prediction = model.predict(input_data)

        # Return response
        risk = "High Risk" if prediction[0] == 1 else "Low Risk"
        return jsonify({"risk": risk})
    
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)
