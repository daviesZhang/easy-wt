/**
 * BROWSER_VIEW模块的命名固定前缀
 * 必须带上,用于在桌面端主线程识别
 */
export const BROWSER_VIEW_NAME_PREFIX = 'view';
/**
 * 日志控制台的VIEW页面名字
 */
export const CONSOLE_VIEW_NAME = BROWSER_VIEW_NAME_PREFIX + '-log-console';

/**
 * 客户端主窗口名字
 */
export const MAIN_WINDOW_NAME = 'main';
/**
 * 主browser view名字
 */
export const MAIN_VIEW_NAME = BROWSER_VIEW_NAME_PREFIX + '-main';
/**
 * 日志控制台的窗口名字
 */
export const CONSOLE_WINDOW_NAME = 'console';

/**
 * 插入browser view位置和宽高
 */
export interface ViewPlacement {
  height?: number;
  width?: number;
  placement: 'top' | 'left' | 'right' | 'bottom';
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}



/**
 * 客户端主线程,渲染线程通信事件列表
 */
export enum ELECTRON_IPC_EVENT {
  /**
   * 获取browser view bounds
   */
  GET_WINDOW_VIEW_BOUNDS = 'GET_WINDOW_VIEW_BOUNDS',
  /**
   * 关闭窗口的browser view
   */
  CLOSE_WINDOW_VIEW = 'CLOSE_WINDOW_VIEW',

  TOGGLE_BROWSER_VIEW = 'TOGGLE_BROWSER_VIEW',

  ADD_WINDOW_VIEW_BOUNDS = 'ADD_WINDOW_VIEW_BOUNDS',

  SET_TOP_BROWSER_VIEW = 'SET_TOP_BROWSER_VIEW',

  REMOVE_WINDOW_VIEW_BOUNDS = 'REMOVE_WINDOW_VIEW_BOUNDS',
  /**
   * 分离view视图到独立窗口
   */
  SEPARATE_VIEW = 'SEPARATE_VIEW',
  /**
   * 创建一个新的窗口
   */
  CREATE_WINDOW = 'CREATE_WINDOW',

  TOGGLE_DEV_TOOLS = 'TOGGLE_DEV_TOOLS',

  CLOSE_WINDOW = 'CLOSE_WINDOW',

  TOGGLE_THEME = 'TOGGLE_THEME',
}
