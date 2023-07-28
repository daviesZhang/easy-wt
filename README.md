# Easy-Web-Test

基于[playwright](https://playwright.dev/)的一个WEB自动化测试工具



![home](./doc/images/home.jpg)
![report](./doc/images/report.jpg)
![example](./doc/images/example.gif)

## 特性和亮点

* 用例管理
* 并发执行
* 定时执行
* 用例执行报告
* 服务端部署
* 多平台客户端支持 `windows` `mac` `linux`
* 多数据库支持 `sqlite`  `mysql`
* 多浏览器支持 `chrome` `edge` `firefox` `safari`

### 其他常规功能

* 多页面切换测试
* 全页面截图,可见区域截图,指定元素截图
* 录制测试过程
* 用例失败重试
* 步骤失败重试
* 导出详细的HTML报告和PDF报告
* 无需任何浏览器驱动,指定浏览器执行文件路径即可
* 无需编程 Excel式的用例编写过程
* 执行进度实时展示
* 支持步骤循环执行
* 支持分支判断
* 支持用例导入,导出,方便不同数据之间分享

## 使用

下载对应平台的构建包

## 开发

![模块关系](./doc/images/module.jpg)


```npm
npm i --force
```

_当前版本必须加上--force,因为angular16才发布
#jest-preset-angular还未更新,但实际不影响_

安装遇到问题，参考
[ELECTRON安装文档](https://www.electronjs.org/zh/docs/latest/tutorial/installation)

#### 首先启动web端

```npm
npm run web:dev
```

#### 进行桌面端开发

```npm
npm run desktop:dev
```

#### 进行服务端开发

```npm
npm run server:dev
```

## 打包

#### 桌面端

自动根据当前环境打包桌面端安装包,windows下构建exe,mac os构建dmg

```npm
npm run desktop:production
```

#### 服务端

同时构建server和web

```npm
npm run server:production
```





