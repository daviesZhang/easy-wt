import {Injectable} from '@angular/core';

const i18n = {
  "page": "daPage",
  "more": "daMore",
  "to": "daTo",
  "of": "daOf",
  "next": "daNexten",
  "last": "daLasten",
  "first": "daFirsten",
  "previous": "daPreviousen",
  "loadingOoo": "载入中...",
  "selectAll": "daSelect Allen",
  "searchOoo": "daSearch...",
  "blanks": "daBlanc",
  "filterOoo": "筛选...",
  "applyFilter": "daApplyFilter...",
  "equals": "daEquals",
  "notEquals": "daNotEqual",
  "lessThan": "daLessThan",
  "greaterThan": "daGreaterThan",
  "lessThanOrEqual": "daLessThanOrEqual",
  "greaterThanOrEqual": "daGreaterThanOrEqual",
  "inRange": "daInRange",
  "contains": "daContains",
  "notContains": "daNotContains",
  "startsWith": "daStarts dawith",
  "endsWith": "daEnds dawith",
  "andCondition": "daAND",
  "orCondition": "daOR",
  "group": "分组",
  "columns": "列",
  "filters": "laFilters",
  "rowGroupColumns": "laPivot Cols",
  "rowGroupColumnsEmptyMessage": "拖动列头到这里分组",
  "valueColumns": "laValue Cols",
  "pivotMode": "laPivot-Mode",
  "groups": "分组",
  "values": "laValues",
  "pivots": "laPivots",
  "valueColumnsEmptyMessage": "la drag cols to aggregate",
  "pivotColumnsEmptyMessage": "la drag here to pivot",
  "toolPanelButton": "la tool panel",
  "noRowsToShow": "没有数据",
  "pinColumn": "固定列",
  "valueAggregation": "laValue Agg",
  "autosizeThiscolumn": "自定调整列",
  "autosizeColumn": "自动调整列",
  "fitColumn": "列铺满表格",
  "deleteBatch": "批量删除",
  "autoRefresh": "自动刷新",
  "deleteConfirm": "是否删除当前选中行(共选中{{number}})?",
  "paginationTotal": " 第 {{begin}} 至 {{end}} 行 - 共 {{total}} 行",
  "deleteBatchTip": "删除当前选择的行",
  "autosizeAllColumns": "自动调整全部列",
  "groupBy": "分组",
  "ungroupBy": "取消分组",
  "resetColumns": "重置行",
  "expandAll": "全部展开",
  "collapseAll": "全部收缩",
  "toolPanel": "工具面板",
  "export": "导出",
  "csvExport": "导出CSV",
  "excelExport": "导出EXCEL",
  "excelXmlExport": "导出XML",
  "pivotChartAndPivotMode": "laPivot Chart & Pivot Mode",
  "pivotChart": "laPivot Chart",
  "chartRange": "区间图表",
  "columnChart": "柱状图",
  "groupedColumn": "分组",
  "stackedColumn": "堆积",
  "normalizedColumn": "100%堆积",
  "barChart": "横轴柱状图",
  "groupedBar": "分组",
  "stackedBar": "堆积",
  "normalizedBar": "100%堆积",
  "pieChart": "饼图",
  "pie": "饼图",
  "doughnut": "环形图",
  "line": "折线图",
  "xyChart": "散点图",
  "scatter": "分散",
  "bubble": "气泡",
  "areaChart": "面积图",
  "area": "面积",
  "stackedArea": "堆积",
  "normalizedArea": "100%堆积",
  "pinLeft": "左固定",
  "pinRight": "右固定",
  "noPin": "取消固定",
  "sum": "求和",
  "min": "最小",
  "max": "最大",
  "none": "无",
  "count": "单元格",
  "average": "平均值",
  "filteredRows": "laFiltered",
  "selectedRows": "选中行数",
  "totalRows": "总行数",
  "totalAndFilteredRows": "laRows",
  "copy": "复制",
  "copyWithHeaders": "带表头复制",
  "ctrlC": "CTRL + C",
  "paste": "粘贴",
  "ctrlV": "CTRL + V",
  "pivotChartTitle": "laPivot Chart",
  "rangeChartTitle": "数据图表",
  "settings": "图表类型",
  "data": "图表数据",
  "format": "图表设置",
  "categories": "类别",
  "series": "数据集",
  "axis": "轴线",
  "color": "颜色",
  "thickness": "坐标粗细",
  "xRotation": "X轴 旋转",
  "yRotation": "Y轴 旋转",
  "ticks": "标尺设置",
  "width": "标尺粗细",
  "length": "连线长度",
  "padding": "间距",
  "chart": "标题设置",
  "title": "标题",
  "font": "字体",
  "top": "头部",
  "right": "右边",
  "bottom": "下面",
  "left": "左边",
  "labels": "标签",
  "size": "大小",
  "legend": "图例",
  "position": "位置",
  "markerSize": "图例大小",
  "markerStroke": "图例边框",
  "markerPadding": "图例间距",
  "itemPaddingX": "图例之间X轴间距",
  "itemPaddingY": "图例之间Y轴间距",
  "strokeWidth": "边框粗细",
  "offset": "偏移",
  "tooltips": "数据提示",
  "offsets": "偏移",
  "callout": "laCallout",
  "markers": "标记点",
  "shadow": "阴影",
  "blur": "模糊",
  "xOffset": "X轴偏移量",
  "yOffset": "Y轴偏移量",
  "lineWidth": "线条粗细",
  "normal": "普通",
  "bold": "黑体",
  "italic": "斜体",
  "boldItalic": "斜粗体",
  "fillOpacity": "内容透明度",
  "strokeOpacity": "边框透明度",
  "columnGroup": "Column",
  "barGroup": "Bar",
  "pieGroup": "Pie",
  "lineGroup": "Line",
  "scatterGroup": "Scatter",
  "areaGroup": "Area",
  "groupedColumnTooltip": "laGrouped",
  "stackedColumnTooltip": "laStacked",
  "normalizedColumnTooltip": "la100% Stacked",
  "groupedBarTooltip": "laGrouped",
  "stackedBarTooltip": "laStacked",
  "normalizedBarTooltip": "la100% Stacked",
  "pieTooltip": "laPie",
  "doughnutTooltip": "laDoughnut",
  "lineTooltip": "tooltip",
  "groupedAreaTooltip": "laGrouped",
  "stackedAreaTooltip": "laStacked",
  "normalizedAreaTooltip": "la100% Stacked",
  "scatterTooltip": "laScatter",
  "bubbleTooltip": "laBubble",
  "noDataToChart": "没有可以生成图表的数据",
  "pivotChartRequiresPivotMode": "laPivot Chart requires Pivot Mode enabled.",
  "enable": "启用",
  "columnsTools": "列工具栏",
  "columnRangeChart": "区间柱状图",
  "groupedColumnChart": "分组柱状图",
  "stackedColumnChart": "堆叠柱状图",
  "normalizedColumnChart": "100%堆叠柱状图",
  "barRangeChart": "区间柱状图-横轴",
  "groupedBarChart": "分组柱状图",
  "stackedBarChart": "堆叠柱状图",
  "normalizedBarChart": "100%堆叠柱状图",
  "lineRangeChart": "区间折线图",
  "pieRangeChart": "区间饼图",
  "doughnutChart": "圆环图",
  "areaRangeChart": "区间面积图",
  "stackedAreaChart": "面积堆叠图",
  "normalizedAreaChart": "100%面积堆叠图"
}


@Injectable({
  providedIn: 'root'
})
export class NgxGridTableTranslateService {


  private text: { [key: string]: string } = i18n;

  /**
   * 设置国际化 key-文本 映射对象
   * @param localText
   */
  setI18nText(localText: { [key: string]: string }) {
    this.text = localText;
  }


  /**
   * 翻译方法
   * @param key
   * @param value  参数
   * @param defaultText 默认值，如果没有匹配到key又没有默认值则返回key本身
   */
  translate(key: string, value?: { [key: string]: any }, defaultText?: string): string {
    let text = this.text[key];
    if (!text) {
      return defaultText ? defaultText : key;
    }
    if (!value) {
      return text;
    }
    Object.keys(value).forEach(name => {
      text = text.replace(`{{${name}}}`, value[name]);
    });
    return text;
  }
}
