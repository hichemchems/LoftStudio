# TODO: Fix Database Connection Issue in Tests

## Information Gathered
- The server.js file attempts to authenticate with the database on startup and exits with code 1 if it fails, causing Jest tests to fail.
- There's a mismatch in DB_NAME: .env has 'easygestion', docker-compose.yml has 'loftbarber'.
- Tests are integration tests using supertest, requiring the app to start without database connection in test mode.
- Current tests (server.test.js and auth.test.js) are simple and don't require database operations, but the app import triggers database connection.

## Plan
1. Update .env to set DB_NAME=loftbarber to match docker-compose.yml.
2. Modify server.js to skip database authentication and sync when NODE_ENV === 'test'.
3. Update package.json test script to set NODE_ENV=test.
4. Run tests to verify they pass without database connection.

## Dependent Files to Edit
- backend/.env: Change DB_NAME to loftbarber.
- backend/server.js: Wrap database connection code in NODE_ENV !== 'test' condition.
- backend/package.json: Update test script to set NODE_ENV=test.

## Followup Steps
- Run npm test to verify tests pass.
- If tests require database, consider adding test database setup or mocking Sequelize.
