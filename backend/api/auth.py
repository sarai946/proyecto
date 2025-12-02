# auth.py - Sistema de autenticación con JWT

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

# Configuración de seguridad
SECRET_KEY = "yary-nails-secret-key-2025-super-secure-change-in-production"  # CAMBIAR EN PRODUCCIÓN
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas

# Contexto para hash de contraseñas con Argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
security = HTTPBearer()

# Modelos Pydantic
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    email: Optional[str] = None
    rol: Optional[str] = None

class UserLogin(BaseModel):
    username: str  # Compatible con OAuth2 (puede ser email)
    password: str

class UserRegister(BaseModel):
    nombre: str
    apellido: str = ""
    email: str
    password: str
    telefono: Optional[str] = None
    rol: str = "cliente"  # Por defecto es cliente

class ReservaCreate(BaseModel):
    usuario_id: int
    servicio_id: int
    empleado_id: int
    fecha: str
    hora: str
    estado: str = "pendiente"
    notas: Optional[str] = None

# Funciones de utilidad

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashear contraseña"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crear token JWT"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def decode_token(token: str) -> TokenData:
    """Decodificar y verificar token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        rol: str = payload.get("rol")
        
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        return TokenData(email=email, rol=rol)
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado o inválido"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Obtener usuario actual desde el token"""
    token = credentials.credentials
    token_data = decode_token(token)
    return token_data

async def get_current_admin(current_user: TokenData = Depends(get_current_user)):
    """Verificar que el usuario sea administrador"""
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )
    return current_user

def verify_token_not_blacklisted(token: str, blacklist: set) -> bool:
    """Verificar que el token no esté en la lista negra"""
    return token not in blacklist
