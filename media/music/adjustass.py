import re

def shift_ass_time(input_file, output_file, t):
    """
    读取 .ass 文件，将 Event 中 Dialogue 行的时间轴增加 t 秒，并保存到新文件。

    Args:
        input_file (str): 输入 .ass 文件路径。
        output_file (str): 输出 .ass 文件路径。
        t (float): 需要增加的时间秒数。
    """
    try:
        with open(input_file, 'r', encoding='utf-8') as infile, \
             open(output_file, 'w', encoding='utf-8') as outfile:
            for line in infile:
                if line.startswith('Dialogue:'):
                    parts = line.split(',', 9)
                    if len(parts) == 10:
                        start_time_str = parts[1]
                        end_time_str = parts[2]

                        start_seconds = time_to_seconds(start_time_str)
                        end_seconds = time_to_seconds(end_time_str)

                        new_start_seconds = start_seconds + t
                        new_end_seconds = end_seconds + t

                        parts[1] = seconds_to_time(new_start_seconds)
                        parts[2] = seconds_to_time(new_end_seconds)
                        outfile.write(','.join(parts))
                    else:
                        outfile.write(line) # 如果 Dialogue 行格式不正确，则保持原样
                else:
                    outfile.write(line) # 非 Dialogue 行直接写入新文件
        print(f"文件 '{input_file}' 处理完成，已保存到 '{output_file}'")
    except FileNotFoundError:
        print(f"错误：文件 '{input_file}' 未找到。")
    except Exception as e:
        print(f"发生错误：{e}")

def time_to_seconds(time_str):
    """将 'h:mm:ss.cc' 格式的时间字符串转换为总秒数。"""
    parts = time_str.split(':')
    hours = int(parts[0])
    minutes = int(parts[1])
    seconds_parts = parts[2].split('.')
    seconds = int(seconds_parts[0])
    milliseconds = int(seconds_parts[1]) * 0.01
    return hours * 3600 + minutes * 60 + seconds + milliseconds

def seconds_to_time(total_seconds):
    """将总秒数转换为 'h:mm:ss.cc' 格式的时间字符串。"""
    hours = int(total_seconds // 3600)
    remaining_seconds = total_seconds % 3600
    minutes = int(remaining_seconds // 60)
    seconds = int(remaining_seconds % 60)
    milliseconds = int((remaining_seconds - int(remaining_seconds)) * 100)
    return f"{hours}:{minutes:02d}:{seconds:02d}.{milliseconds:02d}"

if __name__ == "__main__":
    input_file = "media/music/紅蓮の弓矢.ass"  # 替换为你的输入文件名
    output_file = "media/music/紅蓮の弓矢_shifted.ass" # 输出文件名
    shift_time = -1.2  # 需要增加的时间，单位为秒

    shift_ass_time(input_file, output_file, shift_time)