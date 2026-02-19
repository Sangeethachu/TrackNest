# Use official Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend project files
COPY backend/ /app/

# Expose port
EXPOSE 8000

# Run migrations and then the application
CMD python manage.py migrate && python manage.py seed_data && gunicorn --bind 0.0.0.0:8000 expense_tracker.wsgi:application
