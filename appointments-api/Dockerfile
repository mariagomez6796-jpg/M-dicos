# 1. Usar una imagen base oficial de Python
FROM python:3.10-slim

# 2. Establecer el directorio de trabajo DENTRO del contenedor
WORKDIR /app

# 3. Copiar el archivo de requerimientos
COPY requirements.txt .

# 4. Instalar las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copiar TODO el resto de tu código (main.py, etc.)
COPY . .

# 6. Exponer el puerto en el que correrá uvicorn
EXPOSE 8000