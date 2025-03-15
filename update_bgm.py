import requests
import json
from collections import defaultdict
import os
import glob
import datetime
import tempfile
import re
from pathlib import Path

# from dotenv import load_dotenv
# 加载 .env 文件 本地测试时使用
# load_dotenv() 


# API 基础配置
BASE_URL = "https://api.bgm.tv"
BANGUMI_API_KEY = os.getenv("BANGUMI_API_KEY", "")  # 从环境变量获取 API 密钥
HEADERS = {
    "User-Agent": "wakakap/my-private-project",
    "Authorization": f"Bearer {BANGUMI_API_KEY}"
}

# 调用收藏接口
def get_collections(username= 'wakakap', subject_type=2, type=2, limit=50, offset=0):
    url = f"{BASE_URL}/v0/users/{username}/collections"
    params = {
        "subject_type": subject_type,
        "type": type,
        "limit": limit,
        "offset": offset
    }
    try:
        response = requests.get(url, headers=HEADERS, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"请求失败，状态码: {response.status_code}, 错误信息: {response.text}")# 当offset大于收藏总量时会报错400
            return None
    except requests.RequestException as e:
        print(f"请求时发生错误: {e}")
        return None

def get_all_collections(username= 'wakakap', subject_type=2, type=2, limit=50, offsetmax=1251):
    all_data = []
    for offset in range(0, offsetmax, 50):# offset = 0, 50, ..., 1250
        data = get_collections(username, subject_type, type, limit, offset)
        if data and isinstance(data, dict) and 'data' in data:
            all_data.extend(data['data'])
        else:
            print(f"偏移量 {offset} 中断 总数据量: {len(all_data)}")
            return all_data
    print(f"总数据量: {len(all_data)}")
    return all_data

# 数据处理
def sort_anime_by_year(data, filter_list=None, min_rate=6):
    anime_by_year = defaultdict(list)
    for entry in data:
        subject = entry.get('subject', {})
        date = subject.get('date', '')
        if len(str(date).split('-')) < 2:
            date = "0000-00-00"
        year = str(date).split('-')[0]
        tags = entry.get('tags', 'N/A')
        rate = entry.get('rate', 'N/A')
        co_type = entry.get('type', 0)
        # 如果是过滤词，或者是看过的动画里有评分，且评分低于多少的
        if (filter_list is not None and set(tags) & set(filter_list)) or (rate != 'N/A' and rate < min_rate and co_type ==2):
            continue  

        anime_by_year[year].append(entry)
    
    for year in anime_by_year:
        anime_by_year[year] = sorted(anime_by_year[year], key=lambda x: float(x.get('rate', 0)), reverse=True)
    sorted_anime_by_year = dict(sorted(anime_by_year.items(), key=lambda x: x[0], reverse=True))
    return sorted_anime_by_year

# 保存json
def save_sorted_anime(sorted_anime_by_year, save_path):
    os.makedirs('data', exist_ok=True)  # 确保 data 目录存在
    with open(save_path, 'w', encoding='utf-8') as f:
        json.dump(sorted_anime_by_year, f, ensure_ascii=False, indent=4)
    print(f"Sorted anime data saved to {save_path}")

# 过滤函数：判断是否跳过某个作品
def should_skip(item, filter_list, min_rate):
    rate = item.get("rate")
    if rate is None or rate < min_rate:
        return True
    tags = item.get("tags", [])
    return bool(filter_list and set(tags) & set(filter_list))

# 下载图片的函数
def download_image(url, filename):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        with open(filename, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
    except requests.RequestException:
        pass  # 忽略下载失败的图片

# 下载图片主函数
def download_anime_images(data, output_dir="media/image"):
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    illegal_chars = r'[<>:"/\\|?*]'
    for year, items in data.items():
        for item in items:
            subject = item["subject"]
            name = re.sub(illegal_chars, "", subject["name"])
            subject_id = subject["id"]
            image_url = subject["images"]["common"]
            filename = f"{name}_{subject_id}_common.jpg"
            filepath = os.path.join(output_dir, filename)
            if not os.path.exists(filepath):
                download_image(image_url, filepath)

# 删除不符合的图片
def delete_image(sorted_anime, image_dir="media/image"):
    if not os.path.exists(image_dir):
        print(f"目录 {image_dir} 不存在，跳过清理")
        return
    valid_filenames = set()
    illegal_chars = r'[<>:"/\\|?*]'
    for year, items in sorted_anime.items():
        for item in items:
            subject = item["subject"]
            name = re.sub(illegal_chars, "", subject["name"])
            subject_id = subject["id"]
            filename = f"{name}_{subject_id}_common.jpg"
            valid_filenames.add(filename)
    for file in os.listdir(image_dir):# 遍历文件夹，删除不在 valid_filenames 集合中的图片
        file_path = os.path.join(image_dir, file)
        if os.path.isfile(file_path) and file not in valid_filenames:
            os.remove(file_path)
            print(f"删除了无效图片: {file_path}")

def main():
    # 获取数据并保存到临时文件
    data = get_all_collections(type=2) + get_all_collections(type=3)
    # 条目类型
    # 1 = book
    # 2 = anime
    # 3 = music
    # 4 = game
    # 6 = real
    # 类型
    # 1: 想看
    # 2: 看过
    # 3: 在看
    # 4: 搁置
    # 5: 抛弃
    
    # 处理数据并保存最终结果
    animetag_filterlist = {'里番', '肉番', '短片', '国产','欧美'}
    sorted_anime = sort_anime_by_year(data, filter_list=animetag_filterlist)
    save_path = 'data/sorted_anime_by_year.json'
    save_sorted_anime(sorted_anime, save_path)
    # 下载图片
    download_anime_images(sorted_anime)
    # 清理图片
    delete_image(sorted_anime)

# 主流程
if __name__ == "__main__":
    main()
    

    # 更新md日志
    folders = ['tech','diary']
    for i in folders:
        update_md(i)