<#
.SYNOPSIS
  Deletes the Azure resources that only existed for the old ts-converter backend.

.DESCRIPTION
  The conversion now runs in the browser, so the Azure Functions backend
  (repo BaronAdam/ts-converter-be, now archived) is no longer needed.

  Deletes, in order:
    1. Function app            ts-convert-flex
    2. Flex Consumption plan   ASP-DefaultResourceGroupPLC-7ae1
    3. Storage account         defaultresourcegrouab80   (only the function app used it)
    4. Entra app registration  gh-ts-converter-be-deploy (GitHub OIDC deploy identity)
    5. GitHub secrets on the archived backend repo (best effort)

  Kept on purpose: the static web app "ts-converter" (the frontend), the resource
  groups, and the $1 monthly budgets.

  Every step is skipped if the resource is already gone, so the script is safe to
  re-run. Each deletion asks for confirmation; use -WhatIf to only see the plan,
  or -Confirm:$false to skip the prompts.

.EXAMPLE
  ./scripts/teardown-backend.ps1 -WhatIf
  ./scripts/teardown-backend.ps1
#>
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
  [string] $ResourceGroup = 'DefaultResourceGroup-PLC',
  [string] $FunctionApp = 'ts-convert-flex',
  [string] $Plan = 'ASP-DefaultResourceGroupPLC-7ae1',
  [string] $StorageAccount = 'defaultresourcegrouab80',
  [string] $AppRegistrationName = 'gh-ts-converter-be-deploy',
  [string] $BackendRepo = 'BaronAdam/ts-converter-be'
)

$ErrorActionPreference = 'Stop'

function Test-AzureResource {
  param([string] $Type, [string] $Name)
  $id = az resource list -g $ResourceGroup --resource-type $Type --query "[?name=='$Name'].id | [0]" -o tsv 2>$null
  return [bool] $id
}

az account show --query id -o tsv 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Not logged in. Run: az login' }

# 1. Function app
if (Test-AzureResource 'Microsoft.Web/sites' $FunctionApp) {
  if ($PSCmdlet.ShouldProcess("$ResourceGroup/$FunctionApp", 'Delete function app')) {
    az functionapp delete -n $FunctionApp -g $ResourceGroup
  }
} else { Write-Host "skip: function app $FunctionApp not found" }

# 2. Plan (must go after the app that uses it)
if (Test-AzureResource 'Microsoft.Web/serverFarms' $Plan) {
  if ($PSCmdlet.ShouldProcess("$ResourceGroup/$Plan", 'Delete app service plan')) {
    az appservice plan delete -n $Plan -g $ResourceGroup --yes
  }
} else { Write-Host "skip: plan $Plan not found" }

# 3. Storage account (deletes every blob container in it, including the deployment package)
if (Test-AzureResource 'Microsoft.Storage/storageAccounts' $StorageAccount) {
  if ($PSCmdlet.ShouldProcess("$ResourceGroup/$StorageAccount", 'Delete storage account and ALL its data')) {
    az storage account delete -n $StorageAccount -g $ResourceGroup --yes
  }
} else { Write-Host "skip: storage account $StorageAccount not found" }

# 4. Entra app registration used for GitHub OIDC deploys
$appId = az ad app list --display-name $AppRegistrationName --query '[0].appId' -o tsv 2>$null
if ($appId) {
  if ($PSCmdlet.ShouldProcess("$AppRegistrationName ($appId)", 'Delete app registration')) {
    az ad app delete --id $appId
  }
} else { Write-Host "skip: app registration $AppRegistrationName not found" }

# 5. Secrets on the (archived) backend repo. Archived repos may refuse this; that is fine.
foreach ($secret in 'AZURE_CLIENT_ID', 'AZURE_TENANT_ID', 'AZURE_SUBSCRIPTION_ID') {
  if ($PSCmdlet.ShouldProcess("$BackendRepo secret $secret", 'Delete GitHub secret')) {
    try { gh secret delete $secret --repo $BackendRepo } catch { Write-Warning "could not delete $secret : $_" }
  }
}

Write-Host "`nRemaining resources in ${ResourceGroup}:"
az resource list -g $ResourceGroup --query '[].{name:name,type:type}' -o table
