import App from './modular/app';
import Window from './modular/window';
import Global from './modular/general/global';
import Tray from './modular/additional/tray';
import { logOn } from './modular/general/log';
import { pathOn } from './modular/general/path';
import { fileOn } from './modular/general/file';
import Shortcut from "./modular/enhance/shortcut";
import { init, injeOn } from './process/inje';


await App.start();
// 主要模块
Global.on();//全局模块
Window.on();//窗口模块
Shortcut.on();//快捷键模块
Tray.on();//托盘模块
logOn();//日志模块

// 可选模块
fileOn();//文件模块
pathOn();//路径模块

await App.use([
  import('./modular/general/session'),
  import('./modular/additional/dialog'),
  import('./modular/additional/menu'),
  import('./modular/enhance/update'),
  import('./modular/enhance/socket'),
]);


// 窗口
Window.create(
  {
    show: false,
    customize: {
      id: 0,
      url: 'https://www.ku137.net/',
      isMainWin: true
    }
  }
);

init(0, 1)

injeOn()

Window.create(
  {
    customize: {
      id: 1,
      route: '/main'
    }
  }
);

// 托盘
Tray.create();
