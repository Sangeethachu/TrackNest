# ⚙️ TrackNest Backend

The Django backend for TrackNest, providing a secure and scalable REST API for expense tracking.

## 🚀 Quick Start

1. Activate virtual environment:
   ```bash
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python manage.py runserver
   ```

## 🔐 API Endpoints

- `POST /api/token/`: Get JWT access/refresh tokens.
- `GET /api/expenses/`: List user transactions.
- `POST /api/expenses/`: Create a new transaction.
- `GET /api/categories/`: Get transaction categories.
- `GET /api/budget/`: Get current monthly budget.
- `GET /api/goals/`: Manage savings goals.

## 🗄️ Models

- **Transaction**: Stores income and expense records.
- **Category**: Classifies transactions (Food, Rent, Salary, etc.).
- **SavingsGoal**: Tracks progress towards financial targets.
- **MonthlyBudget**: Stores user-defined spending limits.
- **UserProfile**: Manages user-specific settings and avatars.

For full project documentation, please refer to the [Main README](../README.md).
