from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
# Format: postgresql+psycopg2://username:password@localhost:5432/database_name
default_db_url = 'postgresql+psycopg2://postgres:your_password@localhost:5432/expense_tracker_db'
raw_db_url = os.getenv('DATABASE_URL', default_db_url)

# Ensure driver scheme and handle unencoded @ in password
if raw_db_url.startswith('postgresql://'):
    raw_db_url = raw_db_url.replace('postgresql://', 'postgresql+psycopg2://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = raw_db_url
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
    try:
        db.create_all()
        print("Database tables initialized successfully.")
    except Exception as e:
        print(f"Warning: Could not connect to PostgreSQL database: {e}")
        print("Please ensure PostgreSQL is running and update credentials in backend/.env")

# Routes
@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    try:
        expenses = Expense.query.all()
        return jsonify([exp.to_dict() for exp in expenses])
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    try:
        data = request.get_json()
        if not data or 'title' not in data or 'amount' not in data:
            return jsonify({"error": "Title and amount are required"}), 400

        new_expense = Expense(
            title=data.get("title"),
            amount=float(data.get("amount")),
            category=data.get("category", "General")
        )
        db.session.add(new_expense)
        db.session.commit()
        return jsonify(new_expense.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to add expense: {str(e)}"}), 500

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    try:
        expense = Expense.query.get_or_404(expense_id)
        db.session.delete(expense)
        db.session.commit()
        return jsonify({"message": "Deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete expense: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
