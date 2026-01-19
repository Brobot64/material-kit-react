login:
POST
http://localhost:4000/v1/auth/login

sample body:
{
  "email": "sulaymanibrahim64@gmail.com",
  "password": "Brobot123!"
}

sample response:

{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaWJyYWhpbSBzdWxheW1hbiIsInVzZXJJZCI6IjY5NjI4MjVkODMwMzllNGQ3ODE0ZjIyNSIsInJvbGUiOiJ1c2VyIiwic3RhdHVzIjoiYWN0aXZlIiwidGhlbWVQcmVmZXJlbmNlIjoiZGFyayIsImxhbmd1YWdlUHJlZmVyZW5jZSI6ImVuIiwianRpIjoiZjU1NzExMjItODViMi00NDYzLTgwMzItNjNiN2M0MWExMWY5IiwiaWF0IjoxNzY4NzMxMzkwLCJleHAiOjE3Njg4MTc3OTAsImF1ZCI6InRhamFyYWgudXNlciIsImlzcyI6InRhamFyYWguYXBwIn0.Q_mQYxWY_YbIQDQvveGd8gXXgs4sHT0chRD7b568JNs",
  "user": {
    "_id": "6962825d83039e4d7814f225",
    "fullName": "ibrahim sulayman",
    "email": "sulaymanibrahim64@gmail.com",
    "isActive": true,
    "role": "user",
    "status": "active",
    "themePreference": "dark",
    "languagePreference": "en",
    "createdAt": "2026-01-10T16:46:21.098Z",
    "updatedAt": "2026-01-10T17:11:03.606Z",
    "__v": 0,
    "address": {
      "street": "Al-Medinah Str",
      "city": "Ijebu Ode",
      "state": "Ogun State",
      "country": "Nigeria"
    }
  }
}

save accesstoken and user to storage


http://localhost:4000/v1/auth/register

{
  "fullName": "Ibrahim Sulayman" ,
  "email": "ibrahimsulaymav@gmail.com",
  "password": "Brobot123!",
  "role": "user"
}

response:
{
  "userId": "696df55bb40259ca566da33a",
  "message": "OTP sent to email"
}



Here is the flow;

Register; Verify OTP (must); Login;

If the user otp is not verified yet any time the user logs in verify otp: Open a six digit stand alone box for the otp


http://localhost:4000/v1/auth/verify-otp

{
  "email": "ibrahimsulaymandev@gmail.com",
  "otp": "282449"
}

response:
{
  "message": "Email verified successfully"
}



POST:
http://localhost:4000/v1/auth/resend-otp
{
  "email": "ibrahimsulaymandev@gmail.com"
}

success sample response:
{
  "message": "OTP resent successfully"
}