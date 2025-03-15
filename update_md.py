import requests
import json
from collections import defaultdict
import os
import glob
import datetime
import tempfile
import re
from pathlib import Path

# 更新markdown文本
def update_md(folder):
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    files = glob.glob(f"markdown/{folder}/*.md")
    # 存储文件名和修改时间
    file_data = []
    for f in files:
        name = os.path.splitext(os.path.basename(f))[0]  # 获取不带扩展名的文件名
        mod_time = os.path.getctime(f)  # 获取文件的创建时间
        file_data.append((name, mod_time))
    # 按修改时间倒序排列
    sorted_file_data = sorted(file_data, key=lambda x: x[1], reverse=True)
    # 获取排序后的文件名并以逗号连接
    file_names_str = ",".join([f[0] for f in sorted_file_data])
    # 写入文件
    with open(f"markdown/{folder}/0000-filenames.txt", "w", encoding="utf-8") as f:
        f.write(file_names_str)
    print("更新markdown文本")

def main():
    # 更新md日志
    folders = ['tech','diary']
    for i in folders:
        update_md(i)