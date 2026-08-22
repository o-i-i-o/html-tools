/*
 * 子网计算器 GUI 封装
 *
 * 使用 webview.h(webview/webview 0.10.0,MIT License)的 C API,
 * 将 subnet-calculator-standalone.html 完整内嵌进可执行文件,
 * 运行时不依赖任何外部 HTML/CSS/JS 文件,可离线使用。
 *
 * webview.h 的实现部分基于 C++(STL),由 webview_impl.cc 用 g++
 * 编译成库符号;本文件是纯 C,只调用其 C API。
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "webview.h"
#include "index_html.h"

#define WIN_WIDTH 1280
#define WIN_HEIGHT 900

int main(int argc, char *argv[]) {
  (void)argc;
  (void)argv;

  /* index_html.h 中由 xxd 生成的数组没有 NUL 结尾,拷贝成 C 字符串 */
  size_t html_len = (size_t)index_html_len;
  char *html = malloc(html_len + 1);
  if (html == NULL) {
    fprintf(stderr, "错误:内存分配失败\n");
    return 1;
  }
  memcpy(html, index_html, html_len);
  html[html_len] = '\0';

  webview_t wv = webview_create(0, NULL);
  if (wv == NULL) {
    fprintf(stderr, "错误:创建窗口失败,请在图形桌面环境下运行\n");
    free(html);
    return 1;
  }

  webview_set_title(wv, "子网计算器 | IPv4 / IPv6");
  webview_set_size(wv, WIN_WIDTH, WIN_HEIGHT, WEBVIEW_HINT_NONE);
  webview_set_html(wv, html);

  webview_run(wv);
  webview_destroy(wv);

  free(html);
  return 0;
}
