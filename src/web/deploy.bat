call ./build.bat

IF EXIST web.zip DEL /F web.zip
call "C:\Program Files\7-Zip\7z.exe" a web.zip build startup.sh package.json package-lock.json

call ../.env-prod.bat
call az login --service-principal -u %b-service-principal-user% -p %b-service-principal-password% --tenant %b-service-principal-tenant%
call az webapp config set --resource-group %b-resource-group% --name %b-web% --startup-file "startup.sh"
call az webapp deploy --resource-group %b-resource-group% --name %b-web% --src-path web.zip

