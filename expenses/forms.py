from django import forms
from .models import Transaction

class TransactionForm(forms.ModelForm):
    class Meta:
        model = Transaction
        fields = ['title', 'amount', 'transaction_type', 'category', 'payment_method', 'date', 'description']
        widgets = {
            'date': forms.DateTimeInput(attrs={'type': 'datetime-local', 'class': 'w-full p-2 border rounded-lg'}),
            'title': forms.TextInput(attrs={'class': 'w-full p-2 border rounded-lg', 'placeholder': 'e.g., Grocery'}),
            'amount': forms.NumberInput(attrs={'class': 'w-full p-2 border rounded-lg', 'placeholder': '0.00'}),
            'transaction_type': forms.Select(attrs={'class': 'w-full p-2 border rounded-lg'}),
            'category': forms.Select(attrs={'class': 'w-full p-2 border rounded-lg'}),
            'payment_method': forms.Select(attrs={'class': 'w-full p-2 border rounded-lg'}),
            'description': forms.Textarea(attrs={'class': 'w-full p-2 border rounded-lg', 'rows': 3, 'placeholder': 'Optional notes'}),
        }
