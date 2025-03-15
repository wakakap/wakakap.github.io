import os
import requests
import base64
import json

# 本地测试时取消注释
# from dotenv import load_dotenv
# # 加载 .env 文件
# load_dotenv()

# 获取环境变量
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID', '')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET', '')

# 公开播放列表 URL（这里可以用你确认可用的个人公开歌单）
playlist_urls = [
    "https://open.spotify.com/playlist/4gSiuVzsk6vJ0m4uOfmELO",
    "https://open.spotify.com/playlist/6sYtHxu4f2pWhX98S720nD",
    "https://open.spotify.com/playlist/5PTz6wYFRjG6mK80flgPYx",
]

# 获取 Access Token
def get_access_token(client_id, client_secret):
    auth_url = "https://accounts.spotify.com/api/token"
    auth_string = f"{client_id}:{client_secret}"
    auth_bytes = auth_string.encode("utf-8")
    auth_base64 = base64.b64encode(auth_bytes).decode("utf-8")
    
    headers = {
        "Authorization": f"Basic {auth_base64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}
    
    response = requests.post(auth_url, headers=headers, data=data)
    if response.status_code != 200:
        raise Exception(f"获取令牌失败: {response.status_code} - {response.text}")
    return response.json()["access_token"]

# 从 URL 提取 Playlist ID
def get_playlist_id(url):
    try:
        return url.split("/playlist/")[1].split("?")[0]
    except IndexError:
        raise ValueError(f"无法从 URL 中提取 playlist ID: {url}")

# 获取播放列表详情
def get_playlist_details(playlist_id, token):
    api_url = f"https://api.spotify.com/v1/playlists/{playlist_id}?market=US"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(api_url, headers=headers)
    
    if response.status_code == 404:
        raise Exception(f"播放列表 {playlist_id} 未找到 (404)")
    elif response.status_code != 200:
        raise Exception(f"API 请求失败: {response.status_code} - {response.text}")
    return response.json()

# 保存数据到 JSON 文件
def save_to_json(data, filename="data/spotify_list.json"):
    os.makedirs("data", exist_ok=True)  # 确保 data 目录存在
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"数据已保存到 {filename}")

# 从 JSON 文件读取并打印验证信息
def print_from_json(filename="data/spotify_list.json"):
    with open(filename, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    for playlist in data:
        print(f"\nPlaylist: {playlist['name']}")
        print("-" * 50)
        for idx, track in enumerate(playlist["tracks"], 1):
            print(f"{idx}. Title: {track['title']}")
            print(f"   Artists: {track['artists']}")
            print(f"   Album: {track['album']}")
            print(f"   Release Year: {track['release_year']}")
            print(f"   Cover URL: {track['cover_url']}")
            print("-" * 50)

# 主函数
def main():
    try:
        # 获取 token
        token = get_access_token(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
        print(f"Access Token: {token}")
        
        # 存储所有播放列表数据
        all_playlists_data = []
        
        # 遍历每个播放列表 URL
        for url in playlist_urls:
            playlist_id = get_playlist_id(url)
            try:
                playlist_data = get_playlist_details(playlist_id, token)
                
                # 获取播放列表名称
                playlist_name = playlist_data["name"]
                print(f"\nProcessing Playlist: {playlist_name}")
                
                # 提取歌曲信息
                tracks = []
                for item in playlist_data["tracks"]["items"]:
                    track = item["track"]
                    track_info = {
                        "title": track["name"],
                        "artists": ", ".join(artist["name"] for artist in track["artists"]),
                        "album": track["album"]["name"],
                        "release_year": track["album"]["release_date"].split("-")[0],  # 提取年份
                        "cover_url": track["album"]["images"][0]["url"] if track["album"]["images"] else "N/A",  # 取最高分辨率封面
                        "track_id": track["id"]  # 获取歌曲的ID
                    }
                    tracks.append(track_info)
                
                # 将播放列表信息添加到总数据中
                all_playlists_data.append({
                    "name": playlist_name,
                    "id": playlist_id,
                    "tracks": tracks
                })
            except Exception as e:
                print(f"处理播放列表 {playlist_id} 时出错: {e}")
        
        # 保存到 JSON 文件
        save_to_json(all_playlists_data)
        
        # 从 JSON 文件读取并打印验证信息
        # print("\n验证保存的数据：")
        # print_from_json()
        
    except Exception as e:
        print(f"程序执行出错: {e}")

if __name__ == "__main__":
    main()