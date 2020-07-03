@call export.exe
@echo "导出完成"  
@XCOPY  json\dfwconfigs.json ..\..\Corpse\assets\resources\config\ /y
@echo "拷贝至客户端完成"
 
@pause