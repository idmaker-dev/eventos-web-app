# Configuración de Dominio Personalizado - planoria.com.mx

## 📌 Resumen

Guía completa para configurar el dominio `planoria.com.mx` comprado en GoDaddy con Azure Static Web App.

---

## 🚀 Paso 1: Configurar Dominio en Azure

### 1.1 Acceder a Azure Portal

1. Ve a [Azure Portal](https://portal.azure.com)
2. Busca tu **Static Web App**
3. En el menú lateral, selecciona **"Custom domains"**

### 1.2 Agregar Dominio Personalizado

1. Haz clic en **"+ Add"**
2. Selecciona **"Custom domain on other DNS"**
3. Ingresa el dominio: `planoria.com.mx`
4. Haz clic en **"Next"**

### 1.3 Obtener Valores DNS

Azure te mostrará algo como:

```
Domain Name: planoria.com.mx
Record Type: TXT
Host: @ (or leave empty)
Value: azure-staticapp-verify-XXXXXXXXXXXX
TTL: 3600
```

**¡IMPORTANTE!** Anota estos valores, los necesitarás en GoDaddy.

---

## 🌐 Paso 2: Configurar DNS en GoDaddy

### 2.1 Acceder a Gestión DNS

1. Ve a [GoDaddy](https://www.godaddy.com)
2. **Mi Cuenta** → **Mis productos**
3. Encuentra `planoria.com.mx` y haz clic en **"DNS"**

### 2.2 Agregar Registros DNS

#### Opción A: Dominio Raíz (RECOMENDADO)

**Registro TXT (Verificación de Azure):**

| Tipo | Nombre | Valor                                     | TTL  |
|------|--------|-------------------------------------------|------|
| TXT  | @      | azure-staticapp-verify-XXXXXXXXXXXX       | 600  |

**Registro CNAME para www:**

| Tipo  | Nombre | Valor                                    | TTL  |
|-------|--------|------------------------------------------|------|
| CNAME | www    | {tu-staticwebapp}.azurestaticapps.net    | 3600 |

**Registro A (o ALIAS si está disponible):**

En Azure, obtén la IP de tu Static Web App:
1. Ve a **Overview** de tu Static Web App
2. Busca la sección de **Custom domains**
3. Anota la IP proporcionada

| Tipo | Nombre | Valor           | TTL  |
|------|--------|-----------------|------|
| A    | @      | {IP de Azure}   | 3600 |

#### Opción B: Solo Subdominio www

Si prefieres usar `www.planoria.com.mx`:

| Tipo  | Nombre | Valor                                    | TTL  |
|-------|--------|------------------------------------------|------|
| TXT   | www    | azure-staticapp-verify-XXXXXXXXXXXX      | 600  |
| CNAME | www    | {tu-staticwebapp}.azurestaticapps.net    | 3600 |

### 2.3 Eliminar Registros Conflictivos

**¡IMPORTANTE!** Verifica que no existan registros A o CNAME duplicados:

- Si ves registros A apuntando a otras IPs en `@` → Elimínalos
- Si ves CNAME en `@` (no es estándar) → Elimínalo
- Mantén solo los registros que agregaste para Azure

---

## ✅ Paso 3: Validar el Dominio en Azure

1. Vuelve a **Azure Portal** → Tu Static Web App → **Custom domains**
2. Espera **5-15 minutos** (propagación DNS inicial)
3. Haz clic en **"Validate"** junto a tu dominio
4. Si aparece ✅ verde, ¡el dominio está verificado!

### ⚠️ Solución de Problemas

Si la validación falla:

**Error: "TXT record not found"**
- Verifica que el registro TXT esté correctamente en GoDaddy
- Espera 30-60 minutos adicionales (propagación DNS)
- Usa [whatsmydns.net](https://www.whatsmydns.net/) para verificar propagación

**Error: "CNAME already exists"**
- Elimina cualquier CNAME duplicado en GoDaddy
- Asegúrate de no tener configuraciones previas

**Herramienta de diagnóstico:**
```powershell
# Verificar registro TXT
nslookup -type=TXT planoria.com.mx

# Verificar registro CNAME para www
nslookup -type=CNAME www.planoria.com.mx

# Verificar registro A
nslookup planoria.com.mx
```

---

## 🔒 Paso 4: Certificado SSL (Automático)

Azure Static Web App configura **SSL/HTTPS automáticamente** una vez validado el dominio.

- El certificado se emite en **15-30 minutos**
- Es **gratuito** y se **renueva automáticamente**
- Usa **Let's Encrypt** como autoridad certificadora

Verifica que HTTPS funcione:
```
https://planoria.com.mx
https://www.planoria.com.mx
```

---

## 🔧 Paso 5: Actualizar Variables de Entorno

Actualiza tu archivo `.env` en el frontend:

```env
# Frontend URL Base
REACT_APP_BASE_URL=https://planoria.com.mx

# API URL (si tu Azure Functions tiene dominio personalizado)
REACT_APP_API_URL=https://api.planoria.com.mx/api
REACT_APP_API_VERSION=v1
```

Si tu API sigue en el dominio de Azure Functions:
```env
REACT_APP_API_URL=https://eventosapi-v2.azurewebsites.net/api
```

---

## 📱 Paso 6: Configurar CORS en Azure Functions (Backend)

Tu API debe permitir requests desde el nuevo dominio:

1. Ve a **Azure Portal** → Tu **Function App** (`eventosapi-v2`)
2. En el menú lateral → **CORS**
3. Agrega:
   ```
   https://planoria.com.mx
   https://www.planoria.com.mx
   ```
4. **Elimina** el dominio antiguo `.azurestaticapps.net` si ya no lo usarás

---

## 🧪 Paso 7: Probar la Configuración

### 7.1 Verificación Básica

```powershell
# Test 1: Dominio resuelve correctamente
ping planoria.com.mx

# Test 2: Certificado SSL válido
curl -I https://planoria.com.mx

# Test 3: WWW redirecciona correctamente
curl -I https://www.planoria.com.mx
```

### 7.2 Verificación Funcional

1. Abre `https://planoria.com.mx` en navegador
2. Verifica que el SSL muestra el candado verde 🔒
3. Prueba login/registro
4. Verifica conexión SignalR (notificaciones en tiempo real)
5. Prueba integración con pagos Toku

---

## 🎯 Checklist Final

- [ ] Dominio agregado en Azure Static Web App
- [ ] Registros DNS configurados en GoDaddy:
  - [ ] TXT para verificación
  - [ ] CNAME para www
  - [ ] A o ALIAS para dominio raíz
- [ ] Dominio validado en Azure (✅ verde)
- [ ] Certificado SSL activo (candado 🔒 en navegador)
- [ ] Variables de entorno actualizadas (.env)
- [ ] CORS configurado en Azure Functions
- [ ] Pruebas funcionales completas
- [ ] Dominio antiguo redirige o está deprecado

---

## 📝 Información de Referencia

### Datos del Dominio

- **Dominio:** planoria.com.mx
- **Registrador:** GoDaddy
- **Fecha de configuración:** 19 de febrero de 2026

### URLs

- **Frontend:** https://planoria.com.mx
- **API:** https://eventosapi-v2.azurewebsites.net/api/v1
- **SignalR Hub:** Configurado en Azure Functions

### Tiempos de Propagación DNS

- **Cambios TXT:** 5-30 minutos
- **Cambios CNAME/A:** 15-60 minutos  
- **Propagación global completa:** Hasta 48 horas

### Recursos Útiles

- [Azure Static Web Apps - Custom Domains](https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain)
- [GoDaddy - DNS Management](https://www.godaddy.com/help/manage-dns-680)
- [DNS Propagation Checker](https://www.whatsmydns.net/)
- [SSL Test](https://www.ssllabs.com/ssltest/)

---

## 🆘 Soporte

Si encuentras problemas:

1. Verifica logs en Azure Portal → Static Web App → **Logs**
2. Revisa propagación DNS: [whatsmydns.net](https://www.whatsmydns.net/)
3. Contacta soporte de GoDaddy si hay problemas con DNS
4. Verifica que el certificado SSL se emitió correctamente

---

**¡Listo!** Tu dominio `planoria.com.mx` está configurado profesionalmente con HTTPS automático. 🎉
