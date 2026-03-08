# Backend API Test Script
# Run this in PowerShell to test all endpoints

Write-Host "=== Testing College Resume Portal Backend ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
$healthTime = Measure-Command {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/health"
}
Write-Host "   Response: $($health.message)" -ForegroundColor Green
Write-Host "   Time: $($healthTime.TotalMilliseconds)ms" -ForegroundColor Gray
Write-Host ""

# Test 2: Login
Write-Host "2. Testing Login (Student)..." -ForegroundColor Yellow
$loginBody = @{
    email = "priya.sharma@rgipt.ac.in"
    password = "21CS001@College123"
} | ConvertTo-Json

$loginTime = Measure-Command {
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/auth/login" `
            -Method Post `
            -ContentType "application/json" `
            -Body $loginBody
        $token = $loginResponse.token
        Write-Host "   Login successful!" -ForegroundColor Green
        Write-Host "   User: $($loginResponse.user.name)" -ForegroundColor Green
    } catch {
        Write-Host "   Login failed: $($_.Exception.Message)" -ForegroundColor Red
        exit
    }
}
Write-Host "   Time: $($loginTime.TotalMilliseconds)ms" -ForegroundColor Gray
Write-Host ""

# Test 3: Get Profile
Write-Host "3. Testing Get Profile..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $token"
}

$profileTime = Measure-Command {
    try {
        $profile = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/students/profile" `
            -Headers $headers
        Write-Host "   Profile retrieved!" -ForegroundColor Green
        Write-Host "   Skills: $($profile.profile.skills.Count)" -ForegroundColor Green
        Write-Host "   Projects: $($profile.profile.projects.Count)" -ForegroundColor Green
        Write-Host "   Publications: $($profile.profile.publications.Count)" -ForegroundColor Green
    } catch {
        Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host "   Time: $($profileTime.TotalMilliseconds)ms" -ForegroundColor Gray
Write-Host ""

# Test 4: Get Resume Versions
Write-Host "4. Testing Get Resume Versions..." -ForegroundColor Yellow
$versionsTime = Measure-Command {
    try {
        $versions = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/resume-versions" `
            -Headers $headers
        Write-Host "   Resume versions: $($versions.count)" -ForegroundColor Green
        
        if ($versions.count -gt 0) {
            $resumeId = $versions.resumeVersions[0]._id
            Write-Host "   First resume: $($versions.resumeVersions[0].name)" -ForegroundColor Green
            
            # Test 5: Preview
            Write-Host ""
            Write-Host "5. Testing Preview Endpoint..." -ForegroundColor Yellow
            $previewTime = Measure-Command {
                try {
                    $preview = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/resume-versions/$resumeId/preview" `
                        -Headers $headers
                    $htmlLength = $preview.html.Length
                    Write-Host "   Preview generated!" -ForegroundColor Green
                    Write-Host "   HTML size: $htmlLength characters" -ForegroundColor Green
                } catch {
                    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            Write-Host "   Time: $($previewTime.TotalMilliseconds)ms" -ForegroundColor Gray
        } else {
            Write-Host "   No resume versions found. Create one first!" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host "   Time: $($versionsTime.TotalMilliseconds)ms" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Health Check: $([math]::Round($healthTime.TotalMilliseconds))ms" -ForegroundColor White
Write-Host "Login: $([math]::Round($loginTime.TotalMilliseconds))ms" -ForegroundColor White
Write-Host "Get Profile: $([math]::Round($profileTime.TotalMilliseconds))ms" -ForegroundColor White
Write-Host "Get Versions: $([math]::Round($versionsTime.TotalMilliseconds))ms" -ForegroundColor White
if ($previewTime) {
    Write-Host "Preview: $([math]::Round($previewTime.TotalMilliseconds))ms" -ForegroundColor White
}
Write-Host ""
Write-Host "All tests completed!" -ForegroundColor Green
