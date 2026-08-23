targetScope = 'resourceGroup'

@description('Deployment environment name used for resource naming.')
param environmentName string

@description('Azure region for the resource group and Static Web App.')
param location string = 'eastasia'

var normalizedEnvName = toLower(environmentName)
var compactEnvName = replace(replace(replace(replace(normalizedEnvName, '-', ''), '_', ''), ' ', ''), '.', '')
var uniqueSuffix = take(uniqueString(subscription().id, resourceGroup().id, environmentName), 6)
var staticSiteName = take('swa${compactEnvName}${uniqueSuffix}', 40)

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticSiteName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    allowConfigFileUpdates: true
  }
  tags: {
    'azd-env-name': environmentName
    'azd-service-name': 'web'
  }
}

output STATIC_WEB_APP_NAME string = staticSiteName
output STATIC_WEB_APP_DEFAULT_HOSTNAME string = staticWebApp.properties.defaultHostname
