
# 简介
这个是个demo的例子，新项目基于这个项目的写法。

1. app.js里面应用了两个服务，一个是ligle-engine里面的basic服务。一个是
   自己定义的test服务。
2. 请在services的文件夹里面开发。每个业务建立两个文件，一个是xxxModel.js，一
   个是xxx.js。开发完之后，统一在index.js里面export。
3. app.js里面自动装载services导出的服务。
4. engine里面的服务，是高度抽象的服务，目前并不是一个稳定完善的模块。
   所以，先不用engine提供的服务，先自己写。
