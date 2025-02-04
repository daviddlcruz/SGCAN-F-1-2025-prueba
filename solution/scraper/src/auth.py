import os
import jwt
import requests
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWTError
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.DEBUG)

load_dotenv()

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://f1_auth:5001/api/auth/validate")

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials

    try:
        response = requests.post(AUTH_SERVICE_URL, headers={"Authorization": f"Bearer {token}"})

        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Token invalido o ha expirado.")

        user_data = response.json()

        if not user_data.get("isValid"):
            raise HTTPException(status_code=401, detail="Token invalido o ha expirado.")

        return user_data

    except requests.RequestException:
        raise HTTPException(status_code=500, detail="Servicio de autenticacion no disponible")