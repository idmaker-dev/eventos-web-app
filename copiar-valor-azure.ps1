# Script para copiar el valor CNAME de Azure al portapapeles
# Ejecuta este script y luego pega (Ctrl+V) en GoDaddy

$valorCNAME = "delightful-river-04cbfa010.1.azurestaticapps.net"

# Copiar al portapapeles
Set-Clipboard -Value $valorCNAME

Write-Host "✅ Valor copiado al portapapeles:" -ForegroundColor Green
Write-Host ""
Write-Host "   $valorCNAME" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Ahora ve a GoDaddy y:" -ForegroundColor Yellow
Write-Host "   1. Haz clic en 'Agregar' registro DNS" -ForegroundColor White
Write-Host "   2. Selecciona tipo: CNAME" -ForegroundColor White
Write-Host "   3. Nombre/Host: @  (o 'www' si @ no funciona)" -ForegroundColor White
Write-Host "   4. Valor: Presiona Ctrl+V para pegar" -ForegroundColor White
Write-Host "   5. TTL: 1 hora" -ForegroundColor White
Write-Host "   6. Guarda los cambios" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Después espera 10-15 minutos y haz clic en 'Validar' en Azure" -ForegroundColor Cyan
