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

def parse_federal_bank_statement(pdf_file, user, password=''):
    """
    Parses a Federal Bank PDF statement in-memory using pdfplumber.
    Returns a list of parsed transaction dicts ready for insertion.
    """
    import pdfplumber
    import datetime
    
    parsed_transactions = []
    
    # pdf_file is typically an InMemoryUploadedFile object in Django
    with pdfplumber.open(pdf_file, password=password) as pdf:
        # 7. Protect against massive PDF CPU DoS
        pages_to_process = pdf.pages[:40] 
        
        for page in pages_to_process:
            table = page.extract_table()
            if not table:
                continue
                
            # Iterate through rows
            # Authentic Federal Bank table structure:
            # 0: Date | 1: Value Date | 2: Particulars | 3: Tran Type | 4: Tran ID | 5: Cheque Details | 6: Withdrawals | 7: Deposits | 8: Balance | 9: DR/CR
            if not getattr(page, 'layout_checked', False):
                # Sometimes pdfplumber extracts headers, sometimes it doesn't depending on the page
                pass
                
            for row in table:
                # Basic cleaning
                row = [str(cell).strip() if cell else "" for cell in row]
                
                # Check if this row looks like a data row (usually starts with a date DD-MMM-YYYY like 10-FEB-2026)
                if not row or len(row) < 9:
                    continue
                    
                date_str = row[0]
                
                # Verify date format DD-MMM-YYYY (e.g. 10-FEB-2026)
                if not re.match(r'\d{2}-[A-Za-z]{3}-\d{4}', date_str):
                    continue
                
                try:
                    # Parse Date
                    txn_date = datetime.datetime.strptime(date_str, '%d-%b-%Y').date()
                    
                    # Particulars is at index 2
                    narration = row[2]
                    
                    # Replace newlines in narration (sometimes multi-line cells exist)
                    narration = " ".join(narration.split())
                    
                    # Withdrawals is at index 6, Deposits at index 7
                    withdrawal_str = row[6].replace(',', '')
                    deposit_str = row[7].replace(',', '')
                    
                    # Determine type and amount
                    amount = Decimal('0.00')
                    txn_type = None
                    
                    if withdrawal_str and withdrawal_str != '0' and withdrawal_str != '0.00' and withdrawal_str != '-':
                        amount = Decimal(withdrawal_str)
                        txn_type = 'expense'
                    elif deposit_str and deposit_str != '0' and deposit_str != '0.00' and deposit_str != '-':
                        amount = Decimal(deposit_str)
                        txn_type = 'income'
                        
                    # Basic Smart Categorization Logic
                    assigned_category = 'General'
                    narration_lower = narration.lower()
                    
                    if any(kw in narration_lower for kw in ['zomato', 'swiggy', 'eat', 'food', 'restaurant', 'cafe', 'mcdonald', 'kfc', 'domino']):
                        assigned_category = 'Food'
                    elif any(kw in narration_lower for kw in ['amazon', 'flipkart', 'myntra', 'shop', 'mart', 'supermarket', 'mall', 'store', 'reliance']):
                        assigned_category = 'Shopping'
                    elif any(kw in narration_lower for kw in ['uber', 'ola', 'rapido', 'irctc', 'ticket', 'flight', 'petrol', 'fuel', 'hpcl', 'bpcl', 'ioc']):
                        assigned_category = 'Travel'
                    elif any(kw in narration_lower for kw in ['netflix', 'spotify', 'prime', 'hotstar', 'movie', 'cinema', 'pvr']):
                        assigned_category = 'Entertainment'
                    elif any(kw in narration_lower for kw in ['hospital', 'pharmacy', 'clinic', 'medical', 'doctor', 'apollo', 'medplus']):
                        assigned_category = 'Health'
                    elif any(kw in narration_lower for kw in ['salary', 'neft', 'imps', 'tfr', 'credited']):
                        assigned_category = 'Income' if txn_type == 'income' else 'General'
                    elif any(kw in narration_lower for kw in ['bill', 'recharge', 'airtel', 'jio', 'vi', 'electricity', 'water', 'bescom']):
                        assigned_category = 'Bills'
                        
                    if txn_type and amount > 0:
                        parsed_transactions.append({
                            'title': narration[:255], # Truncate title
                            'amount': amount,
                            'date': txn_date,
                            'transaction_type': txn_type,
                            'category_name': assigned_category
                        })
                except Exception as e:
                    print(f"Failed to parse row: {row}. Error: {e}")
                    continue

    return parsed_transactions

def parse_natural_language_expense(text, user):
    """
    Parses a natural language string to extract amount, title, and date.
    Uses regex + heuristics for basic NLP without requiring an API key.
    Examples: 
      - "Spent 500 on groceries yesterday"
      - "Coffee 150"
      - "swiggy dinner rs 500"
    """
    import datetime
    from decimal import Decimal
    import re
    
    text = text.lower().strip()
    result = {
        'amount': Decimal('0.00'),
        'title': 'Quick Expense',
        'date': datetime.datetime.now().date(),
        'transaction_type': 'expense',
        'category_name': 'General'
    }
    
    # Extract Amount
    # Matches: 500, 500.50, rs 500, ₹500
    amount_match = re.search(r'(?:rs\.?|inr|₹|rs)?\s?(\d+([.,]\d{1,2})?)\s?(?:rs\.?|inr|₹|rupees)?', text)
    if amount_match:
        try:
            result['amount'] = Decimal(amount_match.group(1).replace(',', ''))
            # Remove the amount from text so we can use the rest for title
            text = text.replace(amount_match.group(0), '').strip()
        except:
            pass
            
    # Extract Date
    today = datetime.datetime.now().date()
    if 'yesterday' in text:
        result['date'] = today - datetime.timedelta(days=1)
        text = text.replace('yesterday', '').strip()
    elif 'day before yesterday' in text:
        result['date'] = today - datetime.timedelta(days=2)
        text = text.replace('day before yesterday', '').strip()
    elif 'today' in text:
        text = text.replace('today', '').strip()
        
    # Clean up stop words from the remaining text to get the title
    stop_words = ['spent', 'paid', 'gave', 'on', 'for', 'to', 'rupees', 'rs', 'i', 'had', 'got', 'in', 'at', 'the', 'evening', 'morning', 'afternoon', 'night']
    words = text.split()
    title_words = [w for w in words if w not in stop_words]
    
    if title_words:
        raw_title = " ".join(title_words)
        result['title'] = raw_title.title()
        
        # Categorize
        if any(kw in raw_title for kw in ['zomato', 'swiggy', 'dinner', 'lunch', 'eat', 'food', 'restaurant', 'cafe', 'mcdonald', 'kfc', 'domino', 'coffee', 'tea', 'snacks', 'drink']):
            result['category_name'] = 'Food'
        elif any(kw in raw_title for kw in ['amazon', 'flipkart', 'myntra', 'shop', 'mart', 'supermarket', 'mall', 'store', 'reliance', 'grocery', 'groceries']):
            result['category_name'] = 'Shopping'
        elif any(kw in raw_title for kw in ['uber', 'ola', 'rapido', 'irctc', 'ticket', 'flight', 'petrol', 'fuel', 'hpcl', 'bpcl', 'ioc', 'cab', 'auto']):
            result['category_name'] = 'Travel'
        elif any(kw in raw_title for kw in ['netflix', 'spotify', 'movie', 'cinema']):
            result['category_name'] = 'Entertainment'
        elif 'salary' in raw_title:
            result['category_name'] = 'Income'
            result['transaction_type'] = 'income'
            
    return result
