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

def parse_federal_bank_statement(pdf_file, user):
    """
    Parses a Federal Bank PDF statement in-memory using pdfplumber.
    Returns a list of parsed transaction dicts ready for insertion.
    """
    import pdfplumber
    import datetime
    
    parsed_transactions = []
    
    # pdf_file is typically an InMemoryUploadedFile object in Django
    with pdfplumber.open(pdf_file) as pdf:
        # 7. Protect against massive PDF CPU DoS
        pages_to_process = pdf.pages[:40] 
        
        for page in pages_to_process:
            table = page.extract_table()
            if not table:
                continue
                
            # Iterate through rows
            # A typical Federal Bank table:
            # Date | Particulars / Narration | Chq.No | Withdrawal | Deposit | Balance
            for row in table:
                # Basic cleaning
                row = [str(cell).strip() if cell else "" for cell in row]
                
                # Check if this row looks like a data row (usually starts with a date DD-MM-YYYY)
                if not row or len(row) < 5:
                    continue
                    
                date_str = row[0]
                
                # Verify date format DD-MM-YYYY
                if not re.match(r'\d{2}-\d{2}-\d{4}', date_str):
                    continue
                
                try:
                    # Parse Date
                    txn_date = datetime.datetime.strptime(date_str, '%d-%m-%Y').date()
                    
                    narration = row[1]
                    withdrawal_str = row[3].replace(',', '')
                    deposit_str = row[4].replace(',', '')
                    
                    # Determine type and amount
                    amount = Decimal('0.00')
                    txn_type = None
                    
                    if withdrawal_str and withdrawal_str != '0' and withdrawal_str != '0.00' and withdrawal_str != '-':
                        amount = Decimal(withdrawal_str)
                        txn_type = 'expense'
                    elif deposit_str and deposit_str != '0' and deposit_str != '0.00' and deposit_str != '-':
                        amount = Decimal(deposit_str)
                        txn_type = 'income'
                        
                    if txn_type and amount > 0:
                        parsed_transactions.append({
                            'title': narration[:255], # Truncate title
                            'amount': amount,
                            'date': txn_date,
                            'transaction_type': txn_type,
                            'category_name': 'General' # Default category
                        })
                except Exception as e:
                    print(f"Failed to parse row: {row}. Error: {e}")
                    continue

    return parsed_transactions
