@echo off
REM Windows 下无效
REM set PHP_FCGI_CHILDREN=5

REM 每个进程处理的最大请求数，或设置为 Windows 环境变量
set PHP_FCGI_MAX_REQUESTS=1000
 
echo Starting PHP FastCGI...
RunHiddenConsole E:/SVN/jiangshihecheng/template/env/php-5.6.39-nts-Win32-VC11-x64/php-cgi.exe -b 127.0.0.1:9099 -c E:/SVN/jiangshihecheng/template/env/php-5.6.39-nts-Win32-VC11-x64/php.ini
 
echo Starting nginx...
RunHiddenConsole E:/SVN/jiangshihecheng/template/env/nginx-1.14.0/nginx.exe -p E:/SVN/jiangshihecheng/template/env/nginx-1.14.0
