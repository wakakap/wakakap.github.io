import requests
import json
from collections import defaultdict
import os
import tempfile

# API 基础配置
BASE_URL = "https://api.bgm.tv"
BANGUMI_API_KEY = os.getenv("BANGUMI_API_KEY", "")  # 从环境变量获取 API 密钥
HEADERS = {
    "User-Agent": "wakakap/my-private-project",
    "Authorization": f"Bearer {BANGUMI_API_KEY}"
}

# 调用收藏接口
def get_collections(username, subject_type=2, type=2, limit=50, offset=0):
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
            print(f"请求失败，状态码: {response.status_code}, 错误信息: {response.text}")
            return None
    except requests.RequestException as e:
        print(f"请求时发生错误: {e}")
        return None

def get_all_collections(username, subject_type=2, type=2, limit=50, offsetmax=1251):
    all_data = []
    for offset in range(0, offsetmax, 50):
        data = get_collections(username, subject_type, type, limit, offset)
        if data and isinstance(data, dict) and 'data' in data:
            all_data.extend(data['data'])
        else:
            print(f"偏移量 {offset} 未获取到有效数据")
    print(f"总数据量: {len(all_data)}")
    return all_data

# 获取数据并返回临时文件路径
def save_collections_to_temp():
    data = get_all_collections(username="wakakap", subject_type=2, type=2, offsetmax=1251)
    if not data:
        raise ValueError("未能获取到收藏数据")
    # 使用临时文件保存中间数据
    with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', delete=False) as temp_file:
        json.dump(data, temp_file, ensure_ascii=False, indent=4)
        temp_file_path = temp_file.name
    return temp_file_path

# 数据处理
def sort_anime_by_year(file_path, filter_list=None, min_rate=6):
    anime_by_year = defaultdict(list)
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for entry in data:
        subject = entry.get('subject', {})
        date = subject.get('date', '')
        if len(str(date).split('-')) < 2:
            date = "0000-00-00"
        year = str(date).split('-')[0]
        tags = entry.get('tags', 'N/A')
        rate = entry.get('rate', 0)

        if (filter_list is not None and set(tags) & set(filter_list)) or rate < min_rate:
            continue  

        anime_by_year[year].append(entry)
    
    for year in anime_by_year:
        anime_by_year[year] = sorted(anime_by_year[year], key=lambda x: float(x.get('rate', 0)), reverse=True)
    sorted_anime_by_year = dict(sorted(anime_by_year.items(), key=lambda x: x[0], reverse=True))
    return sorted_anime_by_year

def save_sorted_anime(sorted_anime_by_year, save_path):
    os.makedirs('data', exist_ok=True)  # 确保 data 目录存在
    with open(save_path, 'w', encoding='utf-8') as f:
        json.dump(sorted_anime_by_year, f, ensure_ascii=False, indent=4)
    print(f"Sorted anime data saved to {save_path}")

# 主流程
if __name__ == "__main__":
    # 获取数据并保存到临时文件
    temp_file_path = save_collections_to_temp()
    
    # 处理数据并保存最终结果
    animetag_filterlist = {'里番', '肉番', '短片', '国产','欧美'}
    sorted_anime = sort_anime_by_year(temp_file_path, filter_list=animetag_filterlist)
    save_path = 'data/sorted_anime_by_year.json'
    save_sorted_anime(sorted_anime, save_path)
    
    # 删除临时文件
    os.unlink(temp_file_path)