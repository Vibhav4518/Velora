from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_response(data=None, message="", status_code=200, success=True, errors=None):
    payload = {
        "success": success,
        "message": message,
        "data": data,
        "errors": errors
    }
    return Response(payload, status=status_code)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        custom_data = {
            "success": False,
            "message": response.data.get('detail', 'An error occurred'),
            "errors": response.data if not isinstance(response.data.get('detail'), str) else None,
            "data": None
        }
        response.data = custom_data
    return response
