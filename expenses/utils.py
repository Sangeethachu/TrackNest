import re
from decimal import Decimal

def parse_sms_content(body):
    """
    Parses SMS body to extract amount, merchant/beneficiary, and transaction type.
    Returns a dict: {'amount': Decimal, 'merchant': str, 'type': 'debit'|'credit'}
    Or None if parsing fails.
    """
    body = body.lower()
    data = {}

    # Common RegEx Patterns for Indian Banks/UPI
    # 1. "Debited by 500.00" or "Sent Rs. 500.00"
    amount_patterns = [
        r'(?:debited\s|spent\s|sent\s)(?:rs\.?|inr)\s?([\d,]+\.?\d*)',
        r'(?:rs\.?|inr)\s?([\d,]+\.?\d*)\s(?:debited|spent|sent)',
        r'paid\s(?:rs\.?|inr)\s?([\d,]+\.?\d*)',
    ]

    amount = None
    for pattern in amount_patterns:
        match = re.search(pattern, body)
        if match:
            # Remove commas and convert to Decimal
            raw_amount = match.group(1).replace(',', '')
            try:
                amount = Decimal(raw_amount)
                break
            except:
                continue
    
    if not amount:
        return None  # Could not find amount, skip

    data['amount'] = amount
    data['transaction_type'] = 'expense' # Default to expense for now as per request

    # 2. Extract Merchant / Beneficiary
    # Patterns: "to <Merchant>", "at <Merchant>", "VPA <Merchant>@..."
    merchant_patterns = [
        r'(?:to|at)\s+([a-zA-Z0-9\s]+?)(?:\s+on|\s+ref|\s+upi|\s+from|\.|$)',
        r'vpa\s+([a-zA-Z0-9\s]+?)(?:@|\s)',
    ]
    
    merchant = "Unknown API"
    for pattern in merchant_patterns:
        match = re.search(pattern, body)
        if match:
            merchant = match.group(1).strip()
            break
            
    data['title'] = merchant.title() # Use merchant name as title
    
    # Simple Auto-Categorization
    category_map = {
        'zomato': 'Food',
        'swiggy': 'Food',
        'uber': 'Travel',
        'ola': 'Travel',
        'rapido': 'Travel',
        'amazon': 'Shopping',
        'flipkart': 'Shopping',
        'jio': 'Bills',
        'airtel': 'Bills',
        'netflix': 'Entertainment',
    }
    
    data['category_name'] = 'General' # Default
    for keyword, cat in category_map.items():
        if keyword in merchant.lower():
            data['category_name'] = cat
            break

    return data
