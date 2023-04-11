import os
import glob
import datetime

# 获取当前日期
today = datetime.datetime.now().strftime("%Y-%m-%d")

# 找到所有扩展名为md的文件
files = glob.glob("*.md")

# 去掉文件名中的扩展名
file_names = [os.path.splitext(f)[0] for f in files]

# 将文件名列表反转
file_names.reverse()

# 将文件名按逗号分隔并拼接成字符串
file_names_str = ",".join(file_names)

# 创建新文件并将文件名写入其中
with open(f"0000-filenames_{today}.txt", "w",encoding="utf-8") as f:
    f.write(file_names_str)
