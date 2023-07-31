/**
 * 转化成RMB元字符串
 * @param digits 当数字类型时，允许指定小数点后数字的个数，默认2位小数
 */

export function paramsHtml(value: string): string {
  return value.replace(/(\$\{.+?})/g, `<sapn style="color: #663399">$1</sapn>`);
}
