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

  REMOVE_WINDOW_VIEW_BOUNDS = 'REMOVE_WINDOW_VIEW_BOUNDS',
}
