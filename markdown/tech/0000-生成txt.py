import os
import glob
import datetime

# 获取当前日期
today = datetime.datetime.now().strftime("%Y-%m-%d")

# 找到所有扩展名为md的文件
files = glob.glob("*.md")

# 去掉文件名中的扩展名，并获取最近修改时间
file_data = []
for f in files:
    name = os.path.splitext(f)[0]
    mod_time = os.path.getmtime(f)
    file_data.append((name, mod_time))
    
# 按照修改日期倒序排列
sorted_file_data = sorted(file_data, key=lambda x: x[1], reverse=True)

# 将文件名按逗号分隔并拼接成字符串
file_names_str = ",".join([f[0] for f in sorted_file_data])

# 创建新文件并将文件名写入其中
with open(f"0000-filenames.txt", "w",encoding="utf-8") as f:
    f.write(file_names_str)
