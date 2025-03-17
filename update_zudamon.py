import os
import requests
import time

# VOICEVOX本地服务的默认地址 要打开软件运行
VOICEVOX_URL = "http://localhost:50021"

def generate_audio(text, output_path, speaker_id=1):
    # 第一步：将文本转为音频查询
    query_url = f"{VOICEVOX_URL}/audio_query"
    params = {
        "text": text,
        "speaker": speaker_id
    }
    
    # 获取音频查询参数
    response = requests.post(query_url, params=params)
    response.raise_for_status()
    audio_query = response.json()
    
    # 修改音频参数
    audio_query["prePhonemeLength"] = 0.0  # 发音前空隙设置为0
    audio_query["postPhonemeLength"] = 0.0  # 发音后空隙设置为0
    audio_query["speedScale"] = 1.1       # 语速，默认1.0
    audio_query["pitchScale"] = 0.0       # 音调，默认0.0
    audio_query["intonationScale"] = 1.1  # 语调强度，默认1.0
    audio_query["volumeScale"] = 1.2      # 音量，默认1.0
    
    # 第二步：生成音频
    synthesis_url = f"{VOICEVOX_URL}/synthesis"
    headers = {"Content-Type": "application/json"}
    params = {"speaker": speaker_id}
    
    response = requests.post(
        synthesis_url,
        json=audio_query,
        headers=headers,
        params=params
    )
    response.raise_for_status()
    
    # 保存音频文件
    with open(output_path, "wb") as f:
        f.write(response.content)

def clean_unused_audio(output_dir, valid_files):
    # 获取目录中所有wav文件
    existing_files = [f for f in os.listdir(output_dir) if f.endswith('.wav')]
    valid_files = [item + ".wav" for item in valid_files]
    # 找出需要删除的文件
    files_to_delete = list(set(existing_files) - set(valid_files))
    
    for file in files_to_delete:
        file_path = os.path.join(output_dir, file)
        try:
            os.remove(file_path)
            print(f"已删除多余文件: {file_path}")
        except Exception as e:
            print(f"删除文件 {file_path} 时出错: {str(e)}")

def main():
    # 创建输出文件夹
    output_dir = "media/voice"
    os.makedirs(output_dir, exist_ok=True)
    
    # 读取文件
    input_file = "data/japanese.txt"
    valid_files = []
    try:
        with open(input_file, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        # 处理每一行
        for i, line in enumerate(lines):
            # 去除首尾空白并按逗号分割
            line = line.strip()
            if not line or ',' not in line:
                continue
            part_a, part_b = line.split(',', 1)  # 只分割第一个逗号
            part_a = str(part_a.strip())
            part_b = str(part_b.strip())
            valid_files.append(part_a)
            valid_files.append(part_b)
        
        for text in valid_files:
            # 生成文件名
            file_path = f"{output_dir}/{text}.wav"
            # 检查文件是否已存在
            if os.path.exists(file_path):
                print(f"{text} 已存在，跳过生成")
                continue
            # 生成音频
            print(f"正在处理 {text} ...")
            generate_audio(text, file_path, speaker_id=1)
            print(f"已生成: {text}")
            # 添加短暂延迟避免请求过于频繁
            time.sleep(0.1)

    except FileNotFoundError:
        print(f"错误：找不到文件 {input_file}")
    except Exception as e:
        print(f"发生错误：{str(e)}")
    # 清理多余的音频文件
    clean_unused_audio(output_dir, valid_files)

if __name__ == "__main__":
    main()