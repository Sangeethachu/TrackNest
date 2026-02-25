from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors

data = [
    ['Date', 'Particulars / Narration', 'Chq.No', 'Withdrawal', 'Deposit', 'Balance'],
    ['12-02-2026', 'ZOMATO ONLINE ORDER', '', '500.00', '', '14500.00'],
    ['14-02-2026', 'SALARY NEFT', '', '', '45000.00', '59500.00'],
    ['15-02-2026', 'AMAZON SHOPPING', '', '1200.50', '', '58299.50'],
    ['18-02-2026', 'ELECTRICITY BILL', '', '800.00', '', '57499.50'],
    ['20-02-2026', 'CASH DEPOSIT', '', '', '5000.00', '62499.50']
]

pdf = SimpleDocTemplate("test_federal_statement.pdf", pagesize=letter)
table = Table(data)

# Add basic styling to make it look like a statement table
style = TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.grey),
    ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('BOTTOMPADDING', (0,0), (-1,0), 12),
    ('BACKGROUND', (0,1), (-1,-1), colors.beige),
    ('GRID', (0,0), (-1,-1), 1, colors.black)
])
table.setStyle(style)

elems = []
elems.append(table)
pdf.build(elems)

print("test_federal_statement.pdf created!")
