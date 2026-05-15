@echo off
echo ==========================================
echo   Checking Required Versions
echo ==========================================
echo.

echo --- Java Version ---
java -version 2>&1
echo.

echo --- Maven Version ---
call mvn -version 2>&1 | findstr "Apache Maven Java version"
echo.

echo --- Node.js Version ---
node -v 2>&1
echo.

echo --- npm Version ---
npm -v 2>&1
echo.

echo --- Docker Version (optional) ---
docker -v 2>&1
echo.

echo ==========================================
echo   Expected Versions:
echo   Java: 17 or higher
echo   Maven: 3.8 or higher
echo   Node.js: 18 or higher
echo   Docker: 20.10 or higher (optional)
echo ==========================================
echo.

pause
