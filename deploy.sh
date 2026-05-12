#!/bin/bash
echo "🎣 Iniciando despliegue automático de PESCADIA..."

echo "1/4: Descargando últimos cambios..."
git fetch origin
git reset --hard origin/main

echo "2/4: Compilando e importando Servidor (Backend)..."
sudo docker build -t pescadia-server:latest -t pescadia-server:v2 ./server
sudo docker save pescadia-server:latest pescadia-server:v2 | sudo k3s ctr -n k8s.io images import -

echo "3/4: Compilando e importando Cliente (Frontend)..."
sudo docker build -t frontend:latest -t frontend:v2 ./client
sudo docker save frontend:latest frontend:v2 | sudo k3s ctr -n k8s.io images import -

echo "4/4: Reiniciando servicios en Kubernetes..."
sudo kubectl rollout restart statefulset contenedor-server
sudo kubectl rollout restart statefulset contenedor-client

echo "✅ ¡Despliegue completado con éxito! Todos los sistemas están actualizados."
