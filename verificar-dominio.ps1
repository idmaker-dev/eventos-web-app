# Script de Verificación de Dominio - planoria.com.mx
# Ejecuta este script para verificar la configuración DNS y SSL

Write-Host "🔍 Verificando configuración de planoria.com.mx..." -ForegroundColor Cyan
Write-Host ""

# Función para mostrar resultados
function Show-Result {
    param($Test, $Success, $Message)
    if ($Success) {
        Write-Host "✅ $Test" -ForegroundColor Green
        if ($Message) { Write-Host "   → $Message" -ForegroundColor Gray }
    } else {
        Write-Host "❌ $Test" -ForegroundColor Red
        if ($Message) { Write-Host "   → $Message" -ForegroundColor Yellow }
    }
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "1. Verificando Registro TXT" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
try {
    $txtRecords = Resolve-DnsName -Name planoria.com.mx -Type TXT -ErrorAction Stop
    $azureVerify = $txtRecords | Where-Object { $_.Strings -like "*azure-staticapp-verify*" }
    if ($azureVerify) {
        Show-Result "Registro TXT de Azure encontrado" $true $azureVerify.Strings
    } else {
        Show-Result "Registro TXT de Azure NO encontrado" $false "Verifica que agregaste el registro TXT en GoDaddy"
    }
} catch {
    Show-Result "Error al consultar registro TXT" $false "Puede que aún no se haya propagado (espera 10-30 min)"
}
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "2. Verificando Registro A (Dominio Raíz)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
try {
    $aRecords = Resolve-DnsName -Name planoria.com.mx -Type A -ErrorAction Stop
    if ($aRecords) {
        Show-Result "Registro A encontrado" $true "IP: $($aRecords[0].IPAddress)"
    } else {
        Show-Result "Registro A NO encontrado" $false "Configura el registro A en GoDaddy"
    }
} catch {
    Show-Result "No se pudo resolver registro A" $false "Verifica la configuración en GoDaddy"
}
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "3. Verificando Registro CNAME (www)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
try {
    $cnameRecords = Resolve-DnsName -Name www.planoria.com.mx -Type CNAME -ErrorAction Stop
    if ($cnameRecords) {
        Show-Result "Registro CNAME encontrado" $true "Apunta a: $($cnameRecords[0].NameHost)"
    } else {
        Show-Result "Registro CNAME NO encontrado" $false "Configura el CNAME para www en GoDaddy"
    }
} catch {
    Show-Result "Error al consultar CNAME" $false "Verifica la configuración en GoDaddy"
}
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "4. Verificando HTTPS y Certificado SSL" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Test HTTPS para dominio raíz
try {
    $response = Invoke-WebRequest -Uri "https://planoria.com.mx" -Method Head -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Show-Result "HTTPS en planoria.com.mx funciona" $true "Código: $($response.StatusCode)"
    } else {
        Show-Result "HTTPS responde pero con código: $($response.StatusCode)" $false "Verifica la configuración"
    }
} catch {
    Show-Result "HTTPS en planoria.com.mx NO accesible" $false "Espera a que Azure emita el certificado SSL (15-30 min después de validación)"
}

# Test HTTPS para www
try {
    $response = Invoke-WebRequest -Uri "https://www.planoria.com.mx" -Method Head -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Show-Result "HTTPS en www.planoria.com.mx funciona" $true "Código: $($response.StatusCode)"
    } else {
        Show-Result "HTTPS www responde con código: $($response.StatusCode)" $false
    }
} catch {
    Show-Result "HTTPS en www.planoria.com.mx NO accesible" $false "El subdominio www puede tardar un poco más"
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "5. Ping al Servidor" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
try {
    $ping = Test-Connection -ComputerName planoria.com.mx -Count 2 -ErrorAction Stop
    if ($ping) {
        Show-Result "Servidor responde a ping" $true "Tiempo promedio: $([math]::Round(($ping | Measure-Object -Property ResponseTime -Average).Average, 2)) ms"
    }
} catch {
    Show-Result "Ping falló" $false "Esto es normal si el servidor Azure bloquea ICMP"
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "📊 Resumen" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URLs a probar en el navegador:" -ForegroundColor Yellow
Write-Host "   • https://planoria.com.mx" -ForegroundColor White
Write-Host "   • https://www.planoria.com.mx" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Herramientas útiles:" -ForegroundColor Yellow
Write-Host "   • Propagación DNS: https://www.whatsmydns.net/" -ForegroundColor White
Write-Host "   • Test SSL: https://www.ssllabs.com/ssltest/" -ForegroundColor White
Write-Host "   • Azure Portal: https://portal.azure.com" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Si algo falla:" -ForegroundColor Yellow
Write-Host "   • Registros DNS: Espera 10-60 minutos" -ForegroundColor White
Write-Host "   • Certificado SSL: Espera 15-30 minutos después de validación" -ForegroundColor White
Write-Host "   • Propagación completa: Hasta 48 horas" -ForegroundColor White
Write-Host ""
