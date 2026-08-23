# Azure Deployment Guide (Static Web Apps + azd)

This project is configured for Azure Static Web Apps deployment using Azure Developer CLI (azd).

## Prerequisites

- Azure CLI installed
- Azure Developer CLI (azd) installed
- Azure account with permission to create resources

## Files added for deployment

- azure.yaml
- infra/main.bicep
- infra/main.parameters.json
- staticwebapp.config.json
- web/ (deployment source folder)
- scripts/sync-web.mjs

## Sign in

```powershell
az login
azd auth login
```

## Create environment

```powershell
azd env new clockapp-prod
```

## Set deployment location

```powershell
azd env set AZURE_LOCATION eastasia
```

If you prefer another region, replace `eastasia` with the region you want.

## Provision infrastructure

```powershell
azd provision
```

## Sync app files to deployment folder

```powershell
npm run sync:web
```

## Deploy application

```powershell
azd deploy
```

## One-command flow (provision + deploy)

```powershell
azd up
```

## Useful checks

```powershell
azd env get-values
azd show
```

## Notes

- The app is configured as a single-page app with fallback to `/index.html` in `staticwebapp.config.json`.
- The Static Web App resource is tagged with `azd-service-name=web` for azd service mapping.
- Because Azure Static Web Apps cannot use root as both source and output in this setup, deployment uses `web/` as the service source.
- Run `npm run sync:web` whenever root static files change.
