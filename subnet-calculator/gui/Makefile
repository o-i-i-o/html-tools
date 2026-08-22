# 子网计算器 GUI 构建脚本
#
# 依赖(Linux):gtk+-3.0 与 webkit2gtk-4.1 开发库,例如:
#   sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev build-essential vim-common
#
# make            编译生成 ./subnet-calculator
# make clean      清理构建产物

CC      ?= gcc
CXX     ?= g++
TARGET   = subnet-calculator
HTML     = ../subnet-calculator-standalone.html

CFLAGS   = -std=c11 -O2 -Wall -Wextra
CXXFLAGS = -std=c++11 -O2 -Wall -Wextra
PKGS     = gtk+-3.0 webkit2gtk-4.1

all: $(TARGET)

# 用 xxd 把单文件版 HTML 转成 C 数组,并把符号重命名为 index_html / index_html_len
index_html.h: $(HTML) Makefile
	xxd -i $(HTML) | sed 's/_*subnet_calculator_standalone_html/index_html/g' > $@

$(TARGET): main.c webview_impl.cc index_html.h webview.h
	$(CC) $(CFLAGS) $(shell pkg-config --cflags $(PKGS)) -c main.c -o main.o
	$(CXX) $(CXXFLAGS) $(shell pkg-config --cflags $(PKGS)) -c webview_impl.cc -o webview_impl.o
	$(CXX) -o $@ main.o webview_impl.o $(shell pkg-config --libs $(PKGS))

clean:
	rm -f $(TARGET) main.o webview_impl.o index_html.h

.PHONY: all clean
