# Minimal UI Tests (Playwright)

This is a minimal-framework UI test setup for `bi7-webshop-ui`.

## Why this setup

- Uses exactly one framework: `@playwright/test`
- Covers core user flows with real browser automation
- Mocks backend calls to keep tests stable and fast

## Project layout

- `playwright.config.js` - Playwright config + local static web server
- `tests/*.spec.js` - UI test specs
- `package.json` - scripts and dependencies

## Covered flows

1. Landing page product rendering (`landing.spec.js`)
2. Add-to-cart login guard (`landing.spec.js`)
3. Login request + localStorage behavior (`login.spec.js`)
4. Cart rendering and total calculation (`cart.spec.js`)
5. Checkout form submit and success alert (`checkout.spec.js`)

## Prerequisites

- Node.js 18+
- Google Chrome installed (tests use Playwright `channel: "chrome"`)
- Python 3 (used to serve `src/main/webapp` via `http.server`)

## Install

```bash
cd /home/a2b/src/bi7-webshop-ui/ui-tests
npm install
```

## Run tests

```bash
cd /home/a2b/src/bi7-webshop-ui/ui-tests
npm test
```

## Useful commands

```bash
cd /home/a2b/src/bi7-webshop-ui/ui-tests
npm run test:headed
npm run test:debug
npm run report
```

