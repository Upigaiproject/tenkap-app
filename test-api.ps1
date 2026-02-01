# Tenkap Backend API Test Script

$baseUrl = "http://localhost:3001/api"

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  🧪 TENKAP API TEST" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n[1] Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:3001" -Method Get
$health | ConvertTo-Json -Depth 3
Write-Host "✅ Backend is running!" -ForegroundColor Green

# Test 2: Update Location (User 1)
Write-Host "`n[2] Update Location (User 1)..." -ForegroundColor Yellow
$location1 = @{
    userId = "test-user-1"
    latitude = 41.0082
    longitude = 28.9784
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json

$response1 = Invoke-RestMethod -Uri "$baseUrl/location/update" -Method Post -Body $location1 -ContentType "application/json"
$response1 | ConvertTo-Json -Depth 3
Write-Host "✅ Location updated for User 1" -ForegroundColor Green

# Test 3: Update Location (User 2 - nearby)
Write-Host "`n[3] Update Location (User 2 - nearby)..." -ForegroundColor Yellow
$location2 = @{
    userId = "test-user-2"
    latitude = 41.0092  # ~1.1km away
    longitude = 28.9794
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json

$response2 = Invoke-RestMethod -Uri "$baseUrl/location/update" -Method Post -Body $location2 -ContentType "application/json"
$response2 | ConvertTo-Json -Depth 3
Write-Host "✅ Location updated for User 2" -ForegroundColor Green

# Test 4: Update Location (User 3 - far away)
Write-Host "`n[4] Update Location (User 3 - far away)..." -ForegroundColor Yellow
$location3 = @{
    userId = "test-user-3"
    latitude = 41.0582  # ~5km away
    longitude = 28.9984
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json

$response3 = Invoke-RestMethod -Uri "$baseUrl/location/update" -Method Post -Body $location3 -ContentType "application/json"
$response3 | ConvertTo-Json -Depth 3
Write-Host "✅ Location updated for User 3" -ForegroundColor Green

# Test 5: Get Nearby Users (radius 2km)
Write-Host "`n[5] Get Nearby Users (2km radius from User 1)..." -ForegroundColor Yellow
$nearby = Invoke-RestMethod -Uri "$baseUrl/location/nearby?userId=test-user-1&radius=2000" -Method Get
Write-Host "Found $($nearby.nearby.Count) nearby users:" -ForegroundColor Cyan
$nearby | ConvertTo-Json -Depth 4

# Test 6: Get Location History
Write-Host "`n[6] Get Location History (User 1)..." -ForegroundColor Yellow
$history = Invoke-RestMethod -Uri "$baseUrl/location/history/test-user-1?limit=10" -Method Get
Write-Host "Location history entries: $($history.history.Count)" -ForegroundColor Cyan
$history | ConvertTo-Json -Depth 4

# Test 7: Get Stats
Write-Host "`n[7] Get Database Stats..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "http://localhost:3001/api/debug/stats" -Method Get
$stats | ConvertTo-Json -Depth 3
Write-Host "✅ Stats retrieved" -ForegroundColor Green

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  ✅ ALL TESTS COMPLETED!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
