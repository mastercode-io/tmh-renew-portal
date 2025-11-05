below is update json payload structure for /api/renewal/order endpoint. Source and type are hardcoded for now.
Token and TM number are from initial request response.
The rest is from form submission data "Your contact details" section.
Also, split Name in contact details in to first and last name.

{
"token": "tok_abc123",
"source": "renewal-landing",
"type": "lead",
"data": {
"first_name": "John",
"last_name": "Smith",
"email": "john@example.com",
"phone": "123456789",
"trademark_number": "UK0000123456",
}
}

let's make suret that we use consistent json keys naming style.
I see that initial request response uses snake case, lets stick to it.