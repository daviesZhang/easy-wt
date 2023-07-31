/**
 * 找到字符串中的变量占位符,加上<sapn style="color: #663399">$1</span>
 * @param value
 */
export function paramsHtml(value: string): string {
  return value.replace(
    /(\$\{.+?})/g,
    `<sapn style="color: #663399;font-weight: bold;font-style: oblique;">$1</sapn>`
  );
}
