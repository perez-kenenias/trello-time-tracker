# Required Software Versions

## Before You Build - Check These

### 1. Java JDK 17+ (REQUIRED - The build will fail without this)

**Check:**
```bash
java -version
```

**Expected output:**
```
openjdk version "17.0.x" 202x-xx-xx
OpenJDK Runtime Environment (build 17.0.x+xx)
```

**If you see:**
- `version "1.8.0_xxx"` → You have Java 8. MUST upgrade to 17.
- `version "11.0.x"` → You have Java 11. MUST upgrade to 17.

**Install Java 17:**
- Windows/Mac/Linux: https://adoptium.net/?variant=openjdk17
- Download the **JDK** (not JRE)
- Install it
- Set `JAVA_HOME` environment variable

**Windows - Set JAVA_HOME:**
1. Find your JDK 17 installation path (e.g., `C:\Program Files\Eclipse Adoptium\jdk-17.0.x.x-hotspot`)
2. Open Environment Variables
3. Add new System Variable: `JAVA_HOME` = your JDK path
4. Add to Path: `%JAVA_HOME%\bin`
5. Restart terminal and verify: `java -version`

### 2. Maven 3.8+

**Check:**
```bash
mvn -version
```

**Expected:** Apache Maven 3.8.x or 3.9.x

**Install:** https://maven.apache.org/download.cgi

### 3. Node.js 18+

**Check:**
```bash
node -v
```

**Expected:** v18.x.x or v20.x.x

**Install:** https://nodejs.org (download the LTS version)

### 4. MongoDB 5.0+ (or use Docker)

**Check:**
```bash
mongod --version
```

**Or use Docker (easiest):**
```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

## Version Table

| Component | Exact Version Used | Minimum Required |
|-----------|-------------------|------------------|
| Java | 17 | 17 |
| Maven | 3.9.x | 3.8 |
| Spring Boot | 3.2.0 | 3.2.0 |
| Node.js | 18.x | 18 |
| React | 18.2.0 | 18 |
| MongoDB | 7.0 | 5.0 |
| springdoc-openapi | 2.3.0 | 2.3.0 |
| Lombok | 1.18.30 | 1.18.30 |

## Common Errors

### Error: `invalid flag: --release`
**Cause:** Maven is using Java 8 compiler.
**Fix:** Install JDK 17 and set `JAVA_HOME` to point to it.

### Error: `invalid source release: 17`
**Cause:** Maven compiler plugin is set to Java 17, but your JDK is older.
**Fix:** Same as above - install JDK 17.

### Error: `JAVA_HOME not found`
**Cause:** Environment variable not set.
**Fix:** Set `JAVA_HOME` to your JDK 17 installation folder.

### Error: `Unrecognized field "xxx"`
**Cause:** Lombok is not processing annotations.
**Fix:** Ensure you're using Maven 3.8+ and Java 17.

## Verify Everything Works

Run these commands in order:

```bash
# 1. Check Java
java -version

# 2. Check Maven
mvn -version
# Make sure it says "Java version: 17"

# 3. Check Node
node -v

# 4. Build backend
cd backend
mvn clean package -DskipTests

# 5. If successful, you'll see:
# BUILD SUCCESS
# and target/trello-time-tracker-1.0.0.jar
```
