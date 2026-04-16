@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = 'D:\Program Files\Tencent\Weixin\Weixin.exe'; Start-Process -FilePath $p; Start-Sleep -Milliseconds 500; Start-Process -FilePath $p"
exit
