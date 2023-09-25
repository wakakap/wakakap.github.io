import os
import glob
import sys

if getattr(sys, 'frozen', False):
    # 如果是以可执行文件形式运行
    script_dir = os.path.dirname(sys.executable)
else:
    # 如果是以脚本形式运行
    script_dir = os.path.dirname(os.path.abspath(__file__))

# 找到所有扩展名为md的文件
files = glob.glob(os.path.join(script_dir, "*.md"))

# 去掉文件名中的扩展名
file_names = [os.path.splitext(os.path.basename(f))[0] for f in files]


# 将文件名列表反转
file_names.reverse()

# 将文件名按逗号分隔并拼接成字符串
file_names_str = ",".join(file_names)

file_path = os.path.join(script_dir, '0000-filenames.txt')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(file_names_str)