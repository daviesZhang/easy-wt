/**
 * 找到字符串中的变量占位符,加上<sapn style="color: #663399">$1</span>
 * @param value
 */
export function paramsHtml(value: string): string {
  return value.replace(/(\$\{.+?})/g, `<sapn class="step-variable">$1</sapn>`);
}
