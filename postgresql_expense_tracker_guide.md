# Python Flask & React Expense Tracker with PostgreSQL Integration

Bhai, PostgreSQL integrate karna bohot easy hai! Is guide me hum Flask backend ko PostgreSQL database se connect karenge using `psycopg2` and `SQLAlchemy`.

---

## Step 1: Database Setup (PostgreSQL)

1. Apne PostgreSQL shell (`psql`) ya pgAdmin me login karo.
2. Ek naya database create karo:
   ```sql
   CREATE DATABASE expense_tracker_db;
   ```

---

## Step 2: Backend Updates (Flask & SQLAlchemy)

### 1. Install Required Packages
Apke `backend` virtual environment me yeh dependencies install karo:
```bash
pip install flask flask-cors flask-sqlalchemy psycopg2-binary
```

### 2. Updated `app.py`
Apne `backend/app.py` file ko replace karke yeh code daal do. Isme SQLAlchemy ke through PostgreSQL se connection ho raha hai:

```python
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
CORS(app)

# Database configuration
# Format: postgresql://username:password@localhost:5432/database_name
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:your_password@localhost:5432/expense_tracker_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define Expense Model (Table Schema)
class Expense(db.Model):
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False, default='General')

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "amount": self.amount,
            "category": self.category
        }

# Create database tables automatically
with app.app_context():
    db.create_all()

# Routes
@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    expenses = Expense.query.all()
    return jsonify([exp.to_dict() for exp in expenses])

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.get_json()
    new_expense = Expense(
        title=data.get("title"),
        amount=float(data.get("amount")),
        category=data.get("category", "General")
    )
    db.session.add(new_expense)
    db.session.commit()
    return jsonify(new_expense.to_dict()), 201

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    expense = Expense.query.get_or_404(expense_id)
    db.session.delete(expense)
    db.session.commit()
    return jsonify({"message": "Deleted successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

> **Note:** Apne PostgreSQL ke username (`postgres`) aur password (`your_password`) ko connection string me update zaroor kar lena bhai!

---

## Step 3: Frontend Setup (React)

Frontend me koi bada change nahi karna padega kyunki API endpoints ka format same rakha gaya hai. 

1. Ensure karo ki `frontend/src/App.jsx` me Axios backend (`http://localhost:5000/api/expenses`) se correctly baat kar raha hai.
2. Frontend run karne ke liye:
   ```bash
   cd frontend
   npm run dev
   ```

---

## Step 4: Running the App

1. **Backend Start karo:**
   ```bash
   cd backend
   python app.py
   ```
2. **Frontend Start karo:**
   ```bash
   cd frontend
   npm run dev
   ```

Ab aap jo bhi expense add ya delete karoge, woh direct PostgreSQL database me save aur update hoga! 🚀