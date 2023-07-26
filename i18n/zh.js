var lang = {
  "common": {
    "action": "操作",
    "open_directory": "选择目录",
    "open_file": "选择文件",
    "enable": "启用",
    "delete": "删除",
    "delete_row": "删除勾选的数据",
    "search": "搜索",
    "deleting": "删除中...",
    "delete_success": "删除成功~",
    "copy": "拷贝",
    "copying": "拷贝中...",
    "copy_success": "拷贝成功",
    "save": "保存",
    "confirm": "确定",
    "close": "关闭",
    "cancel": "取消",
    "clear": "清空",
    "ask_confirm": "确定要进行这个操作吗?",
    "begin_time": "开始时间",
    "end_time": "结束时间",
    "id": "ID",
    "today": "今天",
    "seven_day": "七天",
    "to_week": "本周",
    "to_month": "本月",
    "check_pattern": {
      "starts_with": "开头匹配",
      "ends_with": "结尾匹配",
      "contains": "包含",
      "not_contains": "不包含",
      "lt": "小于",
      "le": "小于或等于",
      "equals": "等于",
      "not_equals": "不等于",
      "ge": "大于或等于",
      "gt": "大于",
      "exp": "表达式"
    },
    "keyboard": {
      "type": "连续键入",
      "press": "键入",
      "down": "按下",
      "up": "抬起"
    }
  },
  "app": {
    "ws": {
      "disconnect_title": "已与服务器断开连接",
      "retry_wait": "{{time}}秒后开始重新连接...",
      "retry": "与服务器重连中...",
      "retry_success_title": "重连成功",
      "retry_success_content": "与服务器连接已恢复~"
    },
    "setting": "应用设置",
    "minus": "最小化",
    "reload": "重新载入",
    "close": "退出应用",
    "lang_change": {
      "success_tip":
        "language is switched successfully,  reloaded to take effect.",
      "reload": "reload"
    }
  },
  "env_config": {
    "title": "环境配置",
    "browser_placeholder": "{{browser}}浏览器执行文件地址",
    "browser_user_data": "{{browser}}用户数据目录",
    "concurrent": "用例并发量",
    "concurrent_tip": "用例执行的最大并发量,默认是3个",
    "chromium": "chromium浏览器",
    "chromium_tip": "chromium内核浏览器,例如chrome,edge",
    "webkit": "webkit浏览器",
    "firefox": "firefox浏览器",
    "output": "数据输出路径",
    "output_error": "数据输出路径必须填写~",
    "output_placeholder": "运行中产生的数据输出目录~",
    "db_type": "数据库类型",
    "db_type_placeHolder": "数据库类型",
    "db_host": "主机",
    "db_host_error": "主机地址必须填写~",
    "db_port": "端口",
    "db_port_error": "端口号必须填写且为数字~",
    "db_database": "数据库",
    "db_database_error": "数据库名称必须填写~",
    "db_username": "数据库用户名",
    "db_username_error": "用户名必须填写~",
    "db_username_placeholder": "数据库用户名",
    "db_password": "数据库密码",
    "db_password_placeholder": "数据库密码",
    "db_sqlite": "数据库文件路径",
    "db_sqlite_placeholder": "数据库文件路径",
    "db_sqlite_error": "数据库文件路径或存放目录必须填写~"
  },

  "start": { "fail": "启动核心服务时出现异常~" },
  "report": {
    "dialog_title": "导出{{type}}报告",
    "name_file": "用例报告",
    "download_ready_tip": "用例报告导出已准备就绪,请等待下载自动开始...",
    "exporting": "导出{{type}}文件中...",
    "export_complete": "导出完成~",
    "export_error": "导出失败,请检查相关配置~",
    "disable_step": "已禁用",
    "skip_step": "未执行",
    "stat": {
      "title": "总计",
      "success": "成功运行",
      "total_check": "总检查量",
      "total_success_check": "检查通过",
      "check_proportion": "检查通过率"
    },
    "field": {
      "case_path": "用例路径",
      "name": "用例名称",
      "success": "结果",
      "success_true": "成功",
      "success_false": "失败",
      "browser_type": "浏览器类型",
      "time": "耗时(秒)",
      "total_check": "检查数",
      "success_count": "通过数",
      "count": "执行次数"
    }
  },
  "menu": { "case": "测试用例", "schedule": "定时调度", "report": "测试报告" },
  "run_config": {
    "tip": "成功保存后将生效配置预览(配置会自动从上级目录继承)",
    "button": { "add_params": "添加变量" },
    "field": {
      "step_retry": "步骤重试次数",
      "retry_suffix": "次",
      "step_retry_tip": "当用例中步骤失败时,进行重试的次数",
      "retry": "用例重试次数",
      "retry_tip": "当用例失败时,进行重试的次数",
      "browser_type": "测试浏览器",
      "browser_type_tip": "需要在哪些浏览器中运行用例",
      "browser_type_error_tip": "至少选择一个浏览器进行测试",
      "params": {
        "label": "运行变量",
        "name": "名称",
        "name_tip": "名称必须填写,且不能用以空格开头或结尾~",
        "value": "内容"
      }
    }
  },
  "case": {
    "empty_tip": "请选择用例~",
    "empty_tree": "没有任何用例",
    "delay_placeHolder": "步骤之间延迟时间",
    "add_run_pool": "正在添加用例任务~",
    "add_run_pool_success": "用例任务添加成功~",
    "run_status": { "run": "运行中", "idle": "闲置中" },
    "field": {
      "name": "名称",
      "name_tip": "名称必须填写,且不能用以空格开头或结尾~",
      "run_config": "运行配置",
      "directory": "节点类型",
      "directory_true": "目录",
      "directory_false": "用例"
    },
    "button": {
      "add_case": "添加用例",
      "add_siblings_case": "添加同级节点",
      "add_children_case": "添加下级节点",
      "schedule": "定时运行",
      "editor": "修改配置",
      "delete": "删除节点",
      "run": "运行用例",
      "add_step": "添加步骤",
      "refresh": "刷新"
    }
  },
  "step": {
    "default_name": "新增步骤",
    "bottom_create": "插入一行",
    "enable_tip": "启用/禁用",
    "field": {
      "name": "步骤名称",
      "options": "步骤配置",
      "expression": "内容",
      "desc": "步骤描述",
      "selector": "元素选择器",
      "type": "步骤类型"
    },
    "type_options": {
      "open_browser": "启动浏览器",
      "close_browser": "关闭浏览器",
      "open_page": "打开页面",
      "screenshot": "截图",
      "click_element": "点击元素",
      "click_link": "点击链接",
      "check_element_exist": "检查元素存在",
      "check_element_text": "检查元素文本",
      "wait": "等待",
      "put_params": "设置变量",
      "input_text": "填充文本",
      "struct_if": "IF",
      "struct_else": "ELSE",
      "struct_endif": "END IF",
      "struct_while": "循环开始",
      "struct_endwhile": "循环结束",
      "select_page": "切换页面",
      "keyboard": "键盘事件",
      "run_script": "运行脚本",
      "mouse": "鼠标操作",
      "page_locator": "元素定位器",
      "txt_save": "文本存储",
      "image_save": "图片存储"
    }
  },
  "schedule": {
    "next_time": "下次运行",
    "button": { "add_schedule": "添加定时任务" },
    "field": {
      "case_name": "用例/目录",
      "name": "调度名称",
      "enable": "启用状态",
      "params": "参数",
      "name_error_tip": "定时任务名称必须填写",
      "cron": "cron表达式",
      "cron_validating": "验证中~",
      "cron_required": "cron表达式必须填写~",
      "cron_format": "cron表达式格式不正确~",
      "last_date": "最后运行时间"
    }
  },
  "'js_editor' {
    "'default_title' "'JavaScript脚本'
    "'format_error' "'格式不正确,请检查~',  },
  "'json_editor' {
    "'default_title' "'JSON编辑器'
    "'format_error' "'格式不正确,请检查~',  },
  "'step_selector' {
    "'filter' "'过滤器'
    "'filter_tip' "'基于选择器匹配的内容再次按照文本过滤'
    "'filter_has_text' "'必须存在文本'
    "'filter_has_not_text' "'必须不存在文本'
    "'filter_value_tip' "'过滤器的内容'
    "'filter_value' "'过滤器内容'
    "'exact_tip' "'完全匹配:完全匹配文本.模糊匹配:模糊匹配文本'
    "'exact' "'匹配模式'
    "'exact_true' "'完全匹配'
    "'exact_false' "'模糊匹配'
    "'nth' "'第{{nth}}个'
    "'nth_tip' "'如果匹配到多个,指定选择第几个,从0开始'
    "'nth_label' "'第N个'
    "'connect' "'链接上一个'
    "'connect_tip'
      "'如果存在上一个选择器,怎么处理和上一个选择器的关系,默认不链接'
    "'connect_locator' "'作为子选择器'
    "'connect_and' "'并且'
    "'connect_or' "'或者'
    "'type' "'选择器类型'
    "'type_tip' "'选择器类型'
    "'value_tip' "'选择器内容'
    "'value' "'选择器内容',  },
  "step_options": {
    "change_json": "切换为JSON模式",
    "editor_options_title": "编辑配置",
    "timeout_label": "超时时间",
    "timeout": "超时{{timeout}}ms",
    "alwaysScreenshot_true": "始终截图",
    "alwaysScreenshot_false": "仅失败截图",
    "alwaysScreenshot_label": "检查通过时截图(默认仅失败截图)",
    "screenshot_options": {
      "area": "截图区域",
      "element_true": "截图元素内容",
      "full_page_true": "整页截图",
      'full_page_false': '可视部分',
      'path': '存储路径';
    },

    'put_params': {
      'key_label': '参数名称',
      'simple_label': '值模式',
      'simple_true': '简单模式',
      'simple_false': '表达式',
      'attr': '属性名称',
      'attr_tip':
        '如果需要通过页面元素的属性设置变量,填写属性值,不填默认使用元素内容值';
    },
    'open_browser': {
      'devices_name_label': '设备仿真',
      'devices_name_tip': '内置支持的设备列表',
      'user_agent_tip': '用户代理字符串',
      'user_agent_label': '用户代理',
      'viewport_label': '视窗大小',
      'viewport_tip': '宽,高同时填写时生效',
      'viewport_width': '宽(pixels)',
      'viewport_height': '高(pixels)',
      'viewport': '视窗大小:{{width}}x{{height}}',
      'viewport_size_error': '视窗宽高必须同时设置~',
      'headless': '无头浏览器',
      'headless_label': '使用无头浏览器',
      'record_video': '录制视频',
      'record_video_label': '录制操作过程',
      'executablePath': '路径：{{executablePath}}';
    },
    "check_element_exist": {
      "exist_label": "检查存在",
      "exist_true": "要求元素存在",
      "exist_false": "要求元素不存在"
    },
    "check_element_text": {
      "pattern_label": "匹配模式"
    },
    "click_element": {
      "click_count_label": "单击次数",
      "click_count_placeHolder": "每次单击间的延迟",
      "delay_label": "单击延迟",
      "delay_placeHolder": "单击延迟",
      "click_count": "单击{{count}}次",
      "delay": "单击延迟{{delay}}ms"
    },
    "click_link": {
      "switch_page": "切换到新页面",
      "switch_page_label": "完成后切换到新页面",
      "timeout_tip": "打开链接的超时时间"
    },
    "input_text": {
      "force": "绕过可操作性检查"
    },
    'keyboard': {
      'type': '操作类型';
    },
    'mouse': {
      'type': '操作类型',
      'type_tip': '鼠标事件类型',
      'event_up': '抬起',
      'event_down': '按下',
      'event_move': '移动',
      'event_click': '单击',
      'event_wheel': '滚轮',
      'event_dblclick': '双击',
      'button': '鼠标按键',
      'button_left': '左键',
      'button_middle': '中键',
      'button_right': '右键',
      'mouse_target': '位置/像素',
      'mouse_target_tip': '移动,点击(x,y坐标),滚轮滚动(x,y像素)';
    }
  }
}
