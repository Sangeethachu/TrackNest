from django.http import JsonResponse
from django.db.models import Sum, F
from .models import Transaction, Category, PaymentMethod, SavingsGoal, UserProfile, MonthlyBudget, Notification
from django.contrib.auth.models import User
from decimal import Decimal, InvalidOperation
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    TransactionSerializer, CategorySerializer, PaymentMethodSerializer, 
    SavingsGoalSerializer, MonthlyBudgetSerializer, UserSerializer, NotificationSerializer
)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def home(request):
    return JsonResponse({
        "status": "online",
        "version": "1.2.4",
        "timestamp": timezone.now().isoformat()
    })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    return Response({"status": "healthy"}, status=200)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')

    if not username or not password or not email:
        return Response({'error': 'Please provide username, email and password'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password, first_name=first_name)
    UserProfile.objects.create(user=user, avatar_url=f'https://api.dicebear.com/7.x/avataaars/svg?seed={username}')
    
    # Create Welcome Notification
    Notification.objects.create(
        user=user,
        title='Welcome to TrackNest!',
        message=f"Hi {first_name or username}, thanks for joining! Start by adding your first transaction or setting a budget.",
        notification_type='success'
    )

    refresh = RefreshToken.for_user(user)
    return Response({
        'status': 'success',
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': UserSerializer(user).data
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    
    if not email or not new_password:
        return Response({'error': 'Please provide email and new password'}, status=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({'error': 'No account found with this email'}, status=status.HTTP_404_NOT_FOUND)
        
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def change_pin(request):
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response({'error': 'Please provide current and new password'}, status=status.HTTP_400_BAD_REQUEST)
        
    if not request.user.check_password(current_password):
        return Response({'error': 'Incorrect current password'}, status=status.HTTP_400_BAD_REQUEST)
        
    request.user.set_password(new_password)
    request.user.save()
    
    return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

# Removed add_transaction and get_default_user for security. Use API.

from django.db.models import Sum

def stats_view(request):
    # Aggregate expenses by category
    category_data = Transaction.objects.filter(transaction_type='expense').values('category__name').annotate(total=Sum('amount')).order_by('-total')
    
    # Aggregate expenses by payment method
    payment_method_data = Transaction.objects.filter(transaction_type='expense').values('payment_method__name', 'payment_method__icon').annotate(total=Sum('amount')).order_by('-total')

    # Calculate total expenses
    total_expenses = Transaction.objects.filter(transaction_type='expense').aggregate(Sum('amount'))['amount__sum'] or 0

    # Get recent transactions for the list
    recent_transactions = Transaction.objects.all().order_by('-date')[:5]

    context = {
        'category_data': category_data,
        'payment_method_data': payment_method_data,
        'total_expenses': total_expenses,
        'recent_transactions': recent_transactions,
    }
    return render(request, 'expenses/stats.html', context)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import parse_sms_content
from .models import Transaction, Category, PaymentMethod, SavingsGoal
from django.utils import timezone
import json

@csrf_exempt
def sms_webhook(request):
    """
    Webhook to receive SMS from automation app.
    Expected Payload (JSON):
    {
        "body": "SMS Text Content...",
        "sender": "HDFCBK"
    }
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            body = data.get('body', '')
            sender = data.get('sender', 'Unknown')
            
            parsed = parse_sms_content(body)
            if not parsed:
                return JsonResponse({'status': 'ignored', 'message': 'No transaction details found'}, status=200)

            # Find or Create User (Assuming single user for now or handled via token)
            user = get_default_user()
            
            # Find or Create Category
            category, _ = Category.objects.get_or_create(
                name=parsed.get('category_name', 'General'),
                defaults={'is_income': False}
            )
            
            # Find or Create Payment Method (Based on sender if possible, else generic)
            # Enhanced heuristic for various apps/banks
            sender = sender.upper()
            method_name = "UPI"
            
            if "SLICE" in sender: 
                method_name = "Slice"
                icon_url = "https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Slice_logo.svg/1200px-Slice_logo.svg.png"
            elif "PAYTM" in sender: 
                method_name = "Paytm"
                icon_url = "https://assetscdn1.paytm.com/images/catalog/view/310944/1697527183231.png"
            elif "PHONEPE" in sender: 
                method_name = "PhonePe"
                icon_url = "https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png"
            elif "GPAY" in sender: 
                method_name = "GPay"
                icon_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png"
            elif "HDFC" in sender: 
                method_name = "HDFC Bank"
                icon_url = "https://www.hdfcbank.com/static/brand/logo.png"
            elif "SBI" in sender: 
                method_name = "SBI"
                icon_url = "https://upload.wikimedia.org/wikipedia/en/thumb/5/58/State_Bank_of_India_logo.svg/1200px-State_Bank_of_India_logo.svg.png"
            elif "ICICI" in sender: 
                method_name = "ICICI Bank"
                icon_url = "https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg"
            elif "AXIS" in sender: 
                method_name = "Axis Bank"
                icon_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Axis_Bank_logo.svg/2560px-Axis_Bank_logo.svg.png"
            elif "KOTAK" in sender: 
                method_name = "Kotak Bank"
                icon_url = "https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Kotak_Mahindra_Bank_logo.svg/1200px-Kotak_Mahindra_Bank_logo.svg.png"
            else:
                method_name = "UPI"
                icon_url = ""            
            
            payment_method, created = PaymentMethod.objects.get_or_create(name=method_name)
            if created or not payment_method.icon:
                payment_method.icon = icon_url
                payment_method.save()

            # Create Transaction for the user associated with sender (for now we still use first user for demo SMS, but ideally we'd link phone to user)
            user = User.objects.first() # DEMO ONLY
            if not user:
                return JsonResponse({'status': 'error', 'message': 'No user available for SMS logging'}, status=400)

            transaction = Transaction.objects.create(
                user=user,
                title=parsed.get('title', 'Unknown Merchant'),
                amount=parsed.get('amount'),
                transaction_type='expense',
                category=category,
                payment_method=payment_method,
                date=timezone.now(),
                description=f"Auto-logged from SMS: {sender}"
            )
            
            return JsonResponse({'status': 'success', 'id': transaction.id}, status=201)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'method_not_allowed'}, status=405)

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from .serializers import TransactionSerializer, CategorySerializer, PaymentMethodSerializer, SavingsGoalSerializer, MonthlyBudgetSerializer
from .models import MonthlyBudget

from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def reset_data(request):
    """
    Resets all user data: Transactions, MonthlyBudget, SavingsGoals.
    Keeps Categories and PaymentMethods as they are structural.
    """
    try:
        Transaction.objects.filter(user=request.user).delete()
        MonthlyBudget.objects.filter(user=request.user).delete()
        SavingsGoal.objects.filter(user=request.user).delete()
        
        # Optional: Reset category budget limits to 0
        Category.objects.update(budget_limit=0)
        
        return Response({'status': 'success', 'message': 'All data has been reset.'})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import permission_classes
from rest_framework import permissions
from django.utils.html import escape, strip_tags
from .utils import parse_federal_bank_statement

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_statement(request):
    """
    Endpoint strictly for uploading PDF bank statements securely.
    Processes the file purely in-memory, discarding it immediately after.
    Currently specifically customized for Federal Bank statement formatting.
    """
    if 'file' not in request.FILES:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
    uploaded_file = request.FILES['file']
    
    # 1. Strict File Size Limit (max 5MB) to prevent DoS attacks
    if uploaded_file.size > 5 * 1024 * 1024:
        return Response({"error": "File too large. Maximum size is 5MB."}, status=status.HTTP_400_BAD_REQUEST)

    # 2. Content Type Validation
    if uploaded_file.content_type != 'application/pdf':
        return Response({"error": "Invalid content type. Only strictly PDF files are allowed."}, status=status.HTTP_400_BAD_REQUEST)

    # 3. Strict Magic Bytes Check (First 4 bytes of a typical PDF should be '%PDF')
    magic_bytes = uploaded_file.read(4)
    if magic_bytes != b'%PDF':
        return Response({"error": "File signature invalid. This is not a genuine authentic PDF."}, status=status.HTTP_400_BAD_REQUEST)
    uploaded_file.seek(0) # Reset file pointer back to start

    # Basic filename validation fallback
    if not uploaded_file.name.lower().endswith('.pdf'):
        return Response({"error": "Only PDF files are supported for parsing"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Extract optional password from the request
        pdf_password = request.data.get('password', '')
        
        # Pass the in-memory file to the parser securely encrypted with the user's password
        parsed_transactions = parse_federal_bank_statement(uploaded_file, request.user, password=pdf_password)
        
        # We need a default category and payment method for statement uploads
        default_cat, _ = Category.objects.get_or_create(name='General', defaults={'icon': 'FileText', 'budget_limit': 0})
        default_method, _ = PaymentMethod.objects.get_or_create(name='Bank Transfer', defaults={'icon': 'Landmark'})
        
        created_count = 0
        skipped_count = 0
        
        # Save them into the database securely
        for tx_data in parsed_transactions:
            # 4. Sanitize Strings (Prevent XSS/Injection on title)
            clean_title = strip_tags(tx_data['title'])[:255]
            
            # 5. De-Duplication Logic (Prevent accidental double uploads of the same statement)
            exists = Transaction.objects.filter(
                user=request.user, 
                title=clean_title, 
                amount=tx_data['amount'], 
                date=tx_data['date']
            ).exists()
            
            if not exists:
                Transaction.objects.create(
                    user=request.user,
                    title=clean_title,
                    amount=tx_data['amount'],
                    date=tx_data['date'],
                    transaction_type=tx_data['transaction_type'],
                    category=default_cat,
                    payment_method=default_method
                )
                created_count += 1
            else:
                skipped_count += 1
            
        return Response({
            "status": "success", 
            "message": f"Successfully imported {created_count} transactions (Skipped {skipped_count} duplicates)."
        })
        
    except Exception as e:
        print("Upload statement error: ", str(e)) # Logs to stdout instead of returning traceback to user
        return Response({"error": "Failed to safely parse document. Ensure the file is uncorrupted and format matches."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MonthlyBudgetView(viewsets.ViewSet):
    def list(self, request):
        budget, created = MonthlyBudget.objects.get_or_create(user=request.user)
        serializer = MonthlyBudgetSerializer(budget)
        return Response(serializer.data)

    def create(self, request):
        budget, created = MonthlyBudget.objects.get_or_create(user=request.user)
        amount = request.data.get('amount')
        if amount is not None:
            budget.amount = amount
            budget.save()
            return Response(MonthlyBudgetSerializer(budget).data)
        return Response({'error': 'Amount is required'}, status=400)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        transaction = serializer.save(user=self.request.user)
        
        # Budget Check Logic
        if hasattr(self.request.user, 'monthlybudget'):
            monthly_budget = self.request.user.monthlybudget.amount
            if monthly_budget > 0 and transaction.transaction_type == 'expense':
                user = self.request.user
                current_month = timezone.now().month
                current_year = timezone.now().year
                
                total_expenses = Transaction.objects.filter(
                    user=user, 
                    transaction_type='expense',
                    date__month=current_month, 
                    date__year=current_year
                ).aggregate(Sum('amount'))['amount__sum'] or 0
                
                percentage = (total_expenses / monthly_budget) * 100
                
                if percentage >= 100:
                    if not Notification.objects.filter(
                        user=user, 
                        title='Budget Exceeded!', 
                        created_at__date=timezone.now().date()
                    ).exists():
                         Notification.objects.create(
                            user=user,
                            title='Budget Exceeded!',
                            message=f"You've exceeded your monthly budget of {monthly_budget}!",
                            notification_type='error'
                        )
                elif percentage >= 80:
                    if not Notification.objects.filter(
                        user=user, 
                        title='Budget Alert', 
                        created_at__date=timezone.now().date()
                    ).exists():
                        Notification.objects.create(
                            user=user,
                            title='Budget Alert',
                            message=f"Heads up! You've used {int(percentage)}% of your monthly budget.",
                            notification_type='warning'
                        )

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        transactions = self.get_queryset()
        
        income = transactions.filter(transaction_type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        expense = transactions.filter(transaction_type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        balance = income - expense
        
        recent_transactions = transactions[:5]
        recent_serializer = self.get_serializer(recent_transactions, many=True)

        # Weekly Spending Logic (Last 7 days)
        today = timezone.now().date()
        start_date = today - timedelta(days=6)
        
        daily_stats = (
            transactions.filter(
                transaction_type='expense',
                date__date__range=[start_date, today]
            )
            .annotate(date_only=TruncDate('date'))
            .values('date_only')
            .annotate(total=Sum('amount'))
            .order_by('date_only')
        )
        
        # Format for frontend: Ensure all 7 days are present, default to 0
        weekly_spending = []
        stats_dict = {str(item['date_only']): item['total'] for item in daily_stats}
        
        for i in range(7):
            current_date = start_date + timedelta(days=i)
            day_name = current_date.strftime('%a') # Mon, Tue, etc.
            date_str = str(current_date)
            amount = stats_dict.get(date_str, 0)
            weekly_spending.append({
                "day": day_name,
                "amount": amount,
                "full_date": date_str
            })
        
        # Calculate total budget from MonthlyBudget model
        monthly_budget, _ = MonthlyBudget.objects.get_or_create(user=request.user)
        total_budget = monthly_budget.amount

        return Response({
            "balance": balance,
            "income": income,
            "expense": expense,
            "recent_transactions": recent_serializer.data,
            "weekly_spending": weekly_spending,
            "month_change": self.calculate_monthly_change(transactions),
            "total_budget": float(total_budget)
        })

    def calculate_monthly_change(self, transactions):
        today = timezone.now().date()
        first_day_current_month = today.replace(day=1)
        
        # Balance at the start of the current month (Opening Balance)
        # = Total Income before this month - Total Expense before this month
        opening_income = transactions.filter(
            transaction_type='income',
            date__date__lt=first_day_current_month
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        opening_expense = transactions.filter(
            transaction_type='expense',
            date__date__lt=first_day_current_month
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        opening_balance = opening_income - opening_expense
        
        # Current Balance
        current_income = transactions.filter(transaction_type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        current_expense = transactions.filter(transaction_type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        current_balance = current_income - current_expense
        
        # If opening balance is 0, any positive balance is 100% growth
        if opening_balance == 0:
            if current_balance > 0:
                return 100
            elif current_balance < 0:
                return -100
            else:
                return 0

        # Calculate percentage change
        change = ((current_balance - opening_balance) / abs(opening_balance)) * 100
        return round(change, 1)

    @action(detail=False, methods=['post'])
    def reset_data(self, request):
        """
        Deletes all transactions to reset the dashboard.
        """
        self.get_queryset().delete()
        return Response({'status': 'success', 'message': 'All transactions deleted'})

    @action(detail=False, methods=['get'])
    def analytics_stats(self, request):
        transactions = self.get_queryset().filter(transaction_type='expense')
        
        # 1. Category Distribution
        category_stats = (
            transactions.values('category__name', 'category__icon')
            .annotate(value=Sum('amount'))
            .order_by('-value')
        )
        category_distribution = [
            {
                "name": item['category__name'] or "Uncategorized",
                "value": float(item['value']),
                "icon": item['category__icon']
            } for item in category_stats
        ]

        # 2. Monthly Trend (Last 6 months)
        six_months_ago = timezone.now().date().replace(day=1) - timedelta(days=150)
        monthly_stats = (
            transactions.filter(date__date__gte=six_months_ago)
            .annotate(month=TruncDate('date')) # We'll group by month in Python for better control
            .values('month', 'amount')
        )
        
        # Group by month string (e.g., "Jan")
        trends_dict = {}
        for item in monthly_stats:
            month_name = item['month'].strftime('%b')
            trends_dict[month_name] = trends_dict.get(month_name, 0) + float(item['amount'])
            
        # Ensure last 6 months are present in order
        monthly_trend = []
        for i in range(5, -1, -1):
            target_date = timezone.now().date().replace(day=1) - timedelta(days=i*30)
            month_name = target_date.strftime('%b')
            monthly_trend.append({
                "month": month_name,
                "amount": trends_dict.get(month_name, 0)
            })

        # 3. Summary
        total_spent = transactions.aggregate(Sum('amount'))['amount__sum'] or 0
        avg_daily = total_spent / 30 # Rough estimate for current month
        
        return Response({
            "category_distribution": category_distribution,
            "monthly_trend": monthly_trend,
            "summary": {
                "total_spent": float(total_spent),
                "avg_daily": float(avg_daily),
                "transaction_count": transactions.count()
            }
        })

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        # Categories are global for now, but we use get_queryset for consistency
        return Category.objects.all()

    @action(detail=False, methods=['get'])
    def budget_stats(self, request):
        today = timezone.now().date()
        first_day = today.replace(day=1)
        
        categories = self.get_queryset()
        stats = []
        
        for category in categories:
            # Calculate total spent for this category in current month FOR THIS USER
            spent = Transaction.objects.filter(
                user=request.user,
                category=category,
                transaction_type='expense',
                date__date__gte=first_day
            ).aggregate(Sum('amount'))['amount__sum'] or 0

            
            stats.append({
                'id': category.id,
                'category': category.name,
                'amount': float(spent),
                'budget': float(category.budget_limit),
                'color': category.icon or '#6B7280', # Use icon as color placeholder for now if needed, or add color field later
                'icon': category.icon
            })
            
        return Response(stats)

class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer

class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_amount(self, request, pk=None):
        goal = self.get_object()
        amount = request.data.get('amount')
        
        if amount is None:
            return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount = Decimal(str(amount))
        except (ValueError, TypeError, InvalidOperation):
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_amount = goal.saved_amount
        goal.saved_amount += amount
        goal.save()
        
        # Check if goal reached
        if old_amount < goal.target_amount and goal.saved_amount >= goal.target_amount:
             Notification.objects.create(
                user=request.user,
                title='Goal Reached! 🎉',
                message=f"Congratulations! You've reached your savings goal for '{goal.name}'!",
                notification_type='success'
            )
        
        serializer = self.get_serializer(goal)
        return Response(serializer.data)

@api_view(['GET'])
def current_user(request):
    user = request.user
    # Ensure profile exists
    if not hasattr(user, 'profile'):
        UserProfile.objects.get_or_create(user=user, defaults={'avatar_url': f'https://api.dicebear.com/7.x/avataaars/svg?seed={user.username}'})

    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['POST', 'PUT', 'PATCH'])
def update_profile(request):
    user = request.user

    # Ensure profile exists
    profile, created = UserProfile.objects.get_or_create(user=user)

    # Update User fields
    if 'first_name' in request.data:
        user.first_name = request.data['first_name']
    if 'email' in request.data:
        user.email = request.data['email']
    if 'username' in request.data:
        user.username = request.data['username']
    user.save()

    # Update Profile fields
    if 'avatar_url' in request.data:
        profile.avatar_url = request.data['avatar_url']
    profile.save()

    from .serializers import UserSerializer
    serializer = UserSerializer(user)
    return Response(serializer.data)


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'success'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'success'})



